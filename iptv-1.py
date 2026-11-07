from __future__ import annotations

import asyncio
import base64
import logging
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Set

import httpx
from pydantic_settings import BaseSettings, SettingsConfigDict

# ================= 配置区域 =================
class Settings(BaseSettings):
    # 1. Quake 接口配置
    # ⚠️ 安全提示：下方为明文令牌，建议移入 .env 文件（本类已支持 env_file），
    #    运行时环境变量会覆盖这里的默认值；并尽快轮换已暴露的令牌。
    QUAKE_TOKEN: str = "2213333"
    TEMPLATE_DIR: Path = Path("rtp")

    # 2. GitHub 推送配置
    GITHUB_TOKEN: str = "2232133111"
    GITHUB_USER: str = "Rocsheng"
    GITHUB_REPO: str = "IPTV_RTP"
    GITHUB_BRANCH: str = "main"

    model_config = SettingsConfigDict(env_file=".env")

# ============================================

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    datefmt='%H:%M:%S',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

# 中国省份全称及简称对照表
PROVINCES = ["北京", "天津", "河北", "山西", "内蒙古", "辽宁", "吉林", "黑龙江", "上海", "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南", "广东", "广西", "海南", "重庆", "四川", "贵州", "云南", "西藏", "陕西", "甘肃", "青海", "宁夏", "新疆"]

PROVINCE_ENG_MAP = {
    "北京": "Beijing", "天津": "Tianjin", "河北": "Hebei", "山西": "Shanxi", "内蒙古": "Neimenggu",
    "辽宁": "Liaoning", "吉林": "Jilin", "黑龙江": "Heilongjiang", "上海": "Shanghai", "江苏": "Jiangsu",
    "浙江": "Zhejiang", "安徽": "Anhui", "福建": "Fujian", "江西": "Jiangxi", "山东": "Shandong",
    "河南": "Henan", "湖北": "Hubei", "湖南": "Hunan", "广东": "Guangdong", "广西": "Guangxi",
    "海南": "Hainan", "重庆": "Chongqing", "四川": "Sichuan", "贵州": "Guizhou", "云南": "Yunnan",
    "西藏": "Xizang", "陕西": "Shaanxi", "甘肃": "Gansu", "青海": "Qinghai", "宁夏": "Ningxia", "新疆": "Xinjiang"
}

# 需要保留三级域名的顶级域（如 .com.cn）
MULTI_PART_TLDS = frozenset({"com", "net", "org", "gov", "edu", "gx"})

# 组播地址提取正则（模块级预编译，避免重复编译）
MCAST_RE = re.compile(r'(?:https?://[^/,]+/)?(udp|rtp|igmp)(?:/|://)(\d+\.\d+\.\d+\.\d+:\d+)', re.IGNORECASE)
# 从文本中提取 URL（用于旧源连通性检查）
URL_RE = re.compile(r'https?://[^\s,]+')

# 并发测流上限，避免一次性打爆连接
MAX_CONCURRENT_STREAMS = 50

@dataclass
class QuakeAsset:
    domain: str
    port: int

class IPTVUpdater:
    def __init__(self):
        self.settings = Settings()
        self.semaphore = asyncio.Semaphore(MAX_CONCURRENT_STREAMS)
        # 异步客户端在 main 中通过 async with 创建并托管生命周期
        self.async_client: Optional[httpx.AsyncClient] = None

    def get_root_domain(self, domain: str) -> str:
        """提取根域名，防 DDNS 假去重"""
        if re.match(r'^\d+\.\d+\.\d+\.\d+$', domain):
            return domain
        parts = domain.split('.')
        if len(parts) >= 3:
            if parts[-2] in MULTI_PART_TLDS or len(parts[-2]) <= 2:
                return ".".join(parts[-3:])
            else:
                return ".".join(parts[-2:])
        return domain

    def extract_province(self, filename: str) -> Optional[str]:
        """智能识别省份"""
        for p in PROVINCES:
            if p in filename:
                return p
        return None

    async def check_url_stream(self, url: str) -> Optional[str]:
        """异步 16KB 深度硬核测流验证"""
        async with self.semaphore:
            try:
                async with self.async_client.stream("GET", url) as resp:
                    if resp.status_code == 200:
                        downloaded = 0
                        async for chunk in resp.aiter_bytes(chunk_size=8192):
                            if chunk:
                                downloaded += len(chunk)
                                if downloaded >= 16384:
                                    logger.debug(f" [√ 真有效] {url}")
                                    return url
            except Exception:
                pass
        return None

    async def check_existing_source(self, txt_file: Path, m3u_file: Path) -> bool:
        """检测现有文件是否依然有效"""
        if not txt_file.exists():
            return False

        try:
            content = txt_file.read_text(encoding='utf-8')
            urls = URL_RE.findall(content)[:2]
        except Exception as e:
            logger.error(f"读取文件失败: {e}")
            return False

        if not urls:
            return False

        logger.info(f"[*] 测试现有文件 [{txt_file.name}] 的连通性...")
        for url in urls:
            try:
                async with self.async_client.stream("GET", url, timeout=5) as r:
                    if r.status_code == 200:
                        logger.info(f"[!] 结论: 源依然坚挺，跳过本省份。")
                        return True
            except Exception:
                continue

        logger.info(f"[*] 结论: 源已失效，正在清空旧文件...")
        txt_file.write_text("", encoding='utf-8')
        m3u_file.write_text("", encoding='utf-8')
        return False

    async def get_quake_assets(self, province: str) -> List[QuakeAsset]:
        """请求 Quake 资产"""
        url = "https://quake.360.net/api/v3/search/quake_service"
        query_str = f'app:"udpxy" AND is_domain:true AND province:"{province}"'
        headers = {"X-QuakeToken": self.settings.QUAKE_TOKEN, "Content-Type": "application/json"}
        payload = {"query": query_str, "start": 0, "size": 50, "is_domain": True}

        logger.info(f"[*] 正在请求 Quake API 获取 [{province}] 地区节点...")
        try:
            resp = await self.async_client.post(url, headers=headers, json=payload)
            data = resp.json()
            if resp.status_code == 200 and data.get('code') == 0:
                assets = []
                for item in data.get('data', []):
                    domain = item.get('domain') or item.get('service', {}).get('http', {}).get('host')
                    port = item.get('port')
                    if domain and port:
                        assets.append(QuakeAsset(domain=domain, port=port))
                return assets
        except Exception as e:
            logger.error(f"Quake 请求失败: {e}")
        return []

    def txt_to_m3u_format(self, txt_content: str) -> str:
        """智能转换 M3U 分组格式"""
        m3u_lines = []
        current_group = "未分类"
        for line in txt_content.splitlines():
            line = line.strip()
            if not line:
                continue
            if '#genre#' in line:
                current_group = line.split(',')[0].strip()
            elif ',' in line:
                name, url = [p.strip() for p in line.split(',', 1)]
                m3u_lines.append(f'#EXTINF:-1 group-title="{current_group}",{name}\n{url}')
        return "\n".join(m3u_lines)

    async def process_province(self, template_file: Path):
        """单一省份核心流水线"""
        province = self.extract_province(template_file.name)
        if not province:
            logger.warning(f"无法从文件名识别省份: {template_file.name}")
            return

        eng_name = PROVINCE_ENG_MAP.get(province, province)
        out_txt = Path(f"{eng_name}.txt")
        out_m3u = Path(f"{eng_name}.m3u")

        logger.info(f"\n{'='*20} 正在处理: {province} {'='*20}")

        # 1. 检查旧源
        if await self.check_existing_source(out_txt, out_m3u):
            return

        # 2. 读取母版
        try:
            template_content = template_file.read_text(encoding='utf-8')
        except Exception as e:
            logger.error(f"读取模板失败: {e}")
            return

        # 3. 提取组播靶标
        match = MCAST_RE.search(template_content)
        if not match:
            logger.error("模板中未找到有效的组播地址格式")
            return
        protocol, mcast_target = match.group(1).lower(), match.group(2)
        logger.info(f"[*] 提取测试靶标: /{protocol}/{mcast_target}")

        # 4. 获取资产并去重
        assets = await self.get_quake_assets(province)
        if not assets:
            logger.warning(f"[{province}] 未获取到 Quake 资产")
            return

        urls_to_test: List[str] = []
        host_map: dict[str, str] = {}
        seen_root_domains: Set[str] = set()

        for item in assets:
            pure_domain = item.domain.split(':')[0]
            root_domain = self.get_root_domain(pure_domain)
            if root_domain not in seen_root_domains:
                seen_root_domains.add(root_domain)
                full_host = f"{item.domain}:{item.port}"
                test_url = f"http://{full_host}/{protocol}/{mcast_target}"
                urls_to_test.append(test_url)
                host_map[test_url] = full_host

        # 5. 并发测速
        logger.info(f"[*] 开始并发测速，共 {len(urls_to_test)} 个目标...")
        valid_hosts: List[str] = []

        results = await asyncio.gather(*(self.check_url_stream(url) for url in urls_to_test))

        for res_url in results:
            if res_url:
                valid_hosts.append(host_map[res_url])

        # 6. 生成文件
        if valid_hosts:
            txt_buffer = []
            m3u_buffer = ["#EXTM3U"]

            for host in valid_hosts:
                new_content = MCAST_RE.sub(f'http://{host}/\\1/\\2', template_content)
                txt_buffer.append(new_content)
                m3u_buffer.append(self.txt_to_m3u_format(new_content))

            out_txt.write_text("\n\n".join(txt_buffer), encoding='utf-8')
            out_m3u.write_text("\n\n".join(m3u_buffer), encoding='utf-8')

            logger.info(f"[+] 成功！[{province}] 更新完成，获取 {len(valid_hosts)} 个有效节点。")
        else:
            logger.warning(f"[-] [{province}] 本次搜索全军覆没。")

    async def push_to_github(self, filename: Path):
        """异步推送至 GitHub"""
        if not filename.exists():
            return
        if not self.settings.GITHUB_TOKEN or "your_" in self.settings.GITHUB_TOKEN:
            return

        logger.info(f"[*] 正在推送 [{filename.name}] 到 GitHub...")
        content = filename.read_text(encoding='utf-8')
        api_url = f"https://api.github.com/repos/{self.settings.GITHUB_USER}/{self.settings.GITHUB_REPO}/contents/{filename.name}"

        headers = {
            "Authorization": f"token {self.settings.GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        }

        # 获取 SHA
        sha = ""
        try:
            r = await self.async_client.get(api_url, headers=headers)
            if r.status_code == 200:
                sha = r.json().get("sha", "")
        except Exception as e:
            logger.error(f"获取文件状态失败: {e}")

        payload = {
            "content": base64.b64encode(content.encode('utf-8')).decode('utf-8'),
            "message": f"Auto update {filename.name} at {time.strftime('%Y-%m-%d %H:%M:%S')}",
            "branch": self.settings.GITHUB_BRANCH
        }
        if sha:
            payload["sha"] = sha

        try:
            r = await self.async_client.put(api_url, headers=headers, json=payload)
            if r.status_code in [200, 201]:
                logger.info(f"[+] GitHub 推送成功: {filename.name}")
            else:
                logger.error(f"[-] GitHub 推送失败: {r.text}")
        except Exception as e:
            logger.error(f"推送请求异常: {e}")

        await asyncio.sleep(0.5)  # 防限流

    async def main(self):
        # 初始化目录
        self.settings.TEMPLATE_DIR.mkdir(exist_ok=True)

        template_files = sorted(self.settings.TEMPLATE_DIR.glob("*.txt"))
        if not template_files:
            logger.error(f"模板目录 '{self.settings.TEMPLATE_DIR}' 为空，请放入模板文件。")
            return

        # 预先收集本次要处理的省份输出文件，推送时只推这些，避免扫描整个 cwd
        output_files: List[Path] = []
        for tf in template_files:
            province = self.extract_province(tf.name)
            if province:
                eng = PROVINCE_ENG_MAP.get(province, province)
                output_files.extend([Path(f"{eng}.txt"), Path(f"{eng}.m3u")])

        # 串行处理每个省份（保持对 Quake API 的友好节奏）
        async with httpx.AsyncClient(
            timeout=15.0,
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=100),
        ) as self.async_client:
            for template_file in template_files:
                await self.process_province(template_file)

            logger.info("\n[] 本地文件生成完毕，准备执行云端同步...")

            # 并发推送至 GitHub（仅推送本次涉及的省份输出文件）
            push_tasks = [self.push_to_github(f) for f in output_files if f.exists()]
            if push_tasks:
                await asyncio.gather(*push_tasks)

        logger.info("\n[] 全部任务完成！")

if __name__ == '__main__':
    asyncio.run(IPTVUpdater().main())
