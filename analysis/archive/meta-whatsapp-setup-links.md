# Meta WhatsApp Cloud API — Official Developer Setup Links

This document provides curated, official Meta documentation and portal links required for setting up, configuring, and maintaining the VeriVoice WhatsApp Cloud API integration.

---

## 1. Official Meta Portals & Dashboards

### Meta for Developers Portal
- **URL**: [https://developers.facebook.com/](https://developers.facebook.com/)
- **Purpose**: Primary entrance for creating Meta Developer accounts, registering apps, and adding Meta products (WhatsApp, Messenger, Graph API).
- **When to Use**: Session start, app registration, product onboarding.
- **Login Required**: Yes (Meta / Facebook personal login).

### Meta App Dashboard
- **URL**: [https://developers.facebook.com/apps/](https://developers.facebook.com/apps/)
- **Purpose**: Access existing developer apps, retrieve Phone Number IDs, copy Access Tokens, and configure Webhooks.
- **When to Use**: Managing active developer apps, copying credentials, updating callback URLs.
- **Login Required**: Yes.

### Meta Business Suite / Settings
- **URL**: [https://business.facebook.com/settings/](https://business.facebook.com/settings/)
- **Purpose**: Manage Business Portfolios, assign System Users, create permanent API Access Tokens, and manage phone numbers.
- **When to Use**: Upgrading from temporary 24-hour access tokens to permanent System User tokens, or registering production business numbers.
- **Login Required**: Yes.

---

## 2. Official Technical Documentation

### WhatsApp Cloud API Overview
- **URL**: [https://developers.facebook.com/docs/whatsapp/cloud-api](https://developers.facebook.com/docs/whatsapp/cloud-api)
- **Purpose**: Comprehensive technical documentation covering Cloud API architecture, REST endpoints, rate limits, and payload schemas.
- **When to Use**: Reference for API request structures, error code lookups, and message types (text, audio, media).
- **Login Required**: No.

### Getting Started Guide (Developer Test Setup)
- **URL**: [https://developers.facebook.com/docs/whatsapp/cloud-api/get-started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- **Purpose**: Step-by-step official guide for using Meta test numbers, sending template messages, and adding test recipient phone numbers.
- **When to Use**: Initial developer sandbox setup and adding team member phone numbers for testing.
- **Login Required**: Yes (for interactive sandbox console).

### Webhooks Setup & Payload Schema Documentation
- **URL**: [https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- **Purpose**: Specification for GET challenge verification, incoming POST payload formats for voice notes, text messages, and status updates.
- **When to Use**: Backend integration, debugging webhook handlers, verifying signature security.
- **Login Required**: No.

### System User & Permanent Token Guide
- **URL**: [https://developers.facebook.com/docs/whatsapp/business-management-api/get-started#system-user](https://developers.facebook.com/docs/whatsapp/business-management-api/get-started#system-user)
- **Purpose**: Official guide for creating permanent (never-expiring) System User tokens in Meta Business Settings.
- **When to Use**: When transitioning from temporary 24-hour developer sandbox tokens to permanent continuous testing.
- **Login Required**: Yes.

---

## 3. Security Notice
> [!IMPORTANT]
> Never use third-party or unofficial token generator websites to create Meta credentials. All credentials MUST be generated exclusively within the official `developers.facebook.com` or `business.facebook.com` domains.
