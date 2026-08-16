# Deployment Platform Selection Analysis

## Overview
Evaluation of free cloud hosting platforms for deploying the VeriVoice Express backend with public HTTPS webhook support.

---

## Platform Comparison

| Platform | Node.js Express Support | Public HTTPS Webhook | Free Tier Available? | Payment Info Required? | Inactivity Behavior | Selection Status |
|---|:---:|:---:|:---:|:---:|---|:---:|
| **Render** | **YES** | **YES** | **YES** | **NO** | Sleeps after 15 min inactivity (spins up in ~30s on web request) | **SELECTED (RECOMMENDED)** |
| **Railway** | **YES** | **YES** | **NO** (Paid trial / credit card required) | **YES** | Active | Alternative |
| **Vercel** | **PARTIAL** | **YES** | **YES** | **NO** | Serverless execution limits on audio buffers | Alternative |
| **Fly.io** | **YES** | **YES** | **NO** (Credit card required) | **YES** | Active | Alternative |
| **ngrok (Local Tunnel)** | **YES** | **YES** | **YES** | **NO** | Active while local machine is running | **SELECTED FOR LOCAL DEMO** |

---

## Render Deployment Blueprint Details
- **Configuration File**: render.yaml created in repository root.
- **Build Command**: npm install
- **Start Command**: npm start
- **Public URL Pattern**: https://verivoice-backend.onrender.com
- **Meta Webhook URL**: https://verivoice-backend.onrender.com/webhook/whatsapp
