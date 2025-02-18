import fetch from "node-fetch";
import fs from "fs/promises";
import HttpsProxyAgent from "https-proxy-agent";

const CN_URL =
  "https://raw.githubusercontent.com/PlexPt/awesome-chatgpt-prompts-zh/main/prompts-zh.json";
const EN_URL =
  "https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv";
const FILE = "./public/prompts.json";

let proxyAgent = null;
if (process.env.https_proxy) {
  proxyAgent = new HttpsProxyAgent(process.env.https_proxy);
}

async function fetchCN() {
  console.log("[Fetch] fetching cn prompts...");
  try {
    const raw = await (await fetch(CN_URL, { agent: proxyAgent })).json();
    return raw.map((v) => [v.act, v.prompt]);
  } catch (error) {
    console.error("[Fetch] failed to fetch cn prompts", error);
    return [];
  }
}

async function fetchEN() {
  console.log("[Fetch] fetching en prompts...");
  try {
    const raw = await (await fetch(EN_URL, { agent: proxyAgent })).text();
    return raw
      .split("\n")
      .slice(1)
      .map((v) => v.split('","').map((v) => v.replace('"', "")));
  } catch (error) {
    console.error("[Fetch] failed to fetch cn prompts", error);
    return [];
  }
}

async function main() {
  Promise.all([fetchCN(), fetchEN()])
    .then(([cn, en]) => {
      fs.writeFile(FILE, JSON.stringify({ cn, en }));
    })
    .catch((e) => {
      console.error("[Fetch] failed to fetch prompts");
      fs.writeFile(FILE, JSON.stringify({ cn: [], en: [] }));
    })
    .finally(() => {
      console.log("[Fetch] saved to " + FILE);
    });
}

main();
