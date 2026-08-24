# 🏗️ CURRENT PUBLIC WIDGET ARCHITECTURE ANALYSIS

## ✅ CURRENT STATE: Two Public Widget Entry Points

### **1. EXISTING PUBLIC WIDGET (src/index.js)**
**Entry:** `src/index.js`  
**Custom Element:** `<consultant-widget>`  
**Status:** ✅ Works as Wix Site Widget

**How it Works:**
```
Wix Site Widget Extension
    ↓
Displays: <consultant-widget instance="xxx"></consultant-widget>
    ↓
index.js registers ConsultantWidget class
    ↓
connectedCallback() reads instance attribute
    ↓
Passes instanceId to RootApp
    ↓
RootApp → PublicWidget (with Wix integration)
    ↓
PublicWidget:
  - Uses wixBridge (Wix communication)
  - Uses wixResizer (iframe height management)
  - Calls wixBridge.notifyReady()
  - Sets widget mode (storefront or dashboard)
```

**Instance Flow:**
```
Wix passes: <consultant-widget instance="wix-instance-123"></consultant-widget>
    ↓
getAttribute("instance") = "wix-instance-123"
    ↓
Stored in Redux + localStorage
    ↓
WixInstanceGuard checks: instance present ✅
    ↓
StorefrontShell renders content
```

---

### **2. NEW CONSULTLY WIDGET (src/consultly-widget.js)**
**Entry:** `src/consultly-widget.js`  
**Custom Element:** `<consultly-widget>`  
**Status:** ⚠️ Doesn't have Wix integration

**Current Implementation:**
```
consultly-widget.js registers ConsultlyWidgetElement
    ↓
connectedCallback() mounts ConsultlyRoot
    ↓
ConsultlyRoot → ConsultlyWidget (routing component)
    ↓
ConsultlyWidget:
  - ❌ NO wixBridge integration
  - ❌ NO wixResizer integration
  - ❌ NO instance attribute handling
  - ❌ NO Wix mode management
```

**The Problem:**
```
When ConsultlyWidget renders:
    ↓
ConsultlyWidget → StorefrontShell
    ↓
StorefrontShell → WixInstanceGuard
    ↓
WixInstanceGuard checks localStorage.getItem("wix_instance")
    ↓
If opened via ngrok: wix_instance = null
    ↓
❌ Access blocked: "No Wix instance — access blocked"
```

---

## 🔍 HOW WIX CONTEXT REACHES THE APP

### **Current Flow for Public Widget (WORKING):**

```
1. WIXDB SIDE (Customer Context):
   ├─ Wix passes customer data via postMessage
   ├─ WixUserContext listens for "WIX_USER_READY" events
   ├─ Reads wixDbId from URL params: ?wixDbId=xxx&wixLoggedIn=true
   └─ Stores in localStorage

2. INSTANCE SIDE (Store/App Context):
   ├─ Wix passes instance via HTML attribute: <consultant-widget instance="wix-instance-123">
   ├─ Custom element's getAttribute("instance")
   ├─ Passes to RootApp as instanceId prop
   ├─ Stored in Redux + localStorage as "wix_instance"
   └─ WixInstanceGuard validates: instance present = access allowed

3. WIX COMMUNICATION SIDE:
   ├─ wixBridge.notifyReady() tells Wix widget is ready
   ├─ wixResizer tracks height changes
   ├─ Widget sends height via postMessage
   ├─ Wix adjusts iframe height
   └─ Full two-way communication established
```

---

## ❌ WHY CONSULTLY WIDGET FAILS WHEN OPENED DIRECTLY

**Opening ngrok URL directly:**
```
https://viewy-hyperintelligently-toshiko.ngrok-free.dev
    ↓
No Wix context (opened in browser, not in Wix page)
    ↓
No instance attribute passed
    ↓
No wix_instance in localStorage
    ↓
WixInstanceGuard → "Access blocked"
```

**Console Output:**
```
✅ [CONSULTLY] Mounted (lightweight, fast!)
wixDbId null
⚠️ Wix user — guest (no wixDbId in URL or storage yet)
⛔ No Wix instance — access blocked
```

---

## 🎯 CORRECT SOLUTION: INTEGRATE INTO WIX PAGE

Instead of embedding ngrok URL, we need:

**THE CORRECT FLOW:**
```
1. Create Wix App Page (public page in Wix)
2. On that page, Wix AUTOMATICALLY provides:
   - instance attribute (Wix context)
   - URL parameters with wixDbId
   - postMessage communication ready
   - iframe height coordination ready

3. Embed <consultly-widget> on that Wix page
   <consultly-widget instance="wix-provided-instance"></consultly-widget>

4. consultly-widget receives proper context:
   ✅ instance attribute set
   ✅ wixDbId in URL params
   ✅ WixInstanceGuard passes
   ✅ StorefrontShell renders
   ✅ React app loads successfully
```

---

## 📋 FILES & COMPONENTS BREAKDOWN

### **Instance & Wix Context:**
| Component | Role | Location |
|-----------|------|----------|
| `WixInstanceGuard` | Validates instance present | `src/components/ProtectRoute/WixInstanceGuard.js` |
| `WixUserContext` | Manages customer (wixDbId) | `src/useContext/WixUserContext.js` |
| `StorefrontShell` | Wraps routes with guards | `src/components/ProtectRoute/StorefrontShell.js` |
| `PublicWidget` | Entry point for public routes | `src/PublicWidget.jsx` |
| `ConsultlyWidget` | Lightweight routing (needs Wix integration) | `src/ConsultlyWidget.jsx` |

### **Wix Integration:**
| Component | Role | Location |
|-----------|------|----------|
| `wixBridge` | Communicates with Wix | `src/integrations/wix/wixBridge.js` |
| `wixResizer` | Manages iframe height | `src/integrations/wix/wixResize.js` |
| `widgetModeManager` | Switches storefront↔dashboard mode | `src/integrations/wix/wixWidgetModes.js` |

### **Custom Elements:**
| Element | Entry Point | Purpose |
|---------|------------|---------|
| `<consultant-widget>` | `src/index.js` | Public widget (has Wix integration) |
| `<consultly-widget>` | `src/consultly-widget.js` | Consultly widget (missing Wix integration) |

---

## 🔑 KEY INSIGHT

**The instance/Wix context problem is NOT:**
- ❌ A code bug
- ❌ A missing feature in ConsultlyWidget
- ❌ A missing authentication

**It IS:**
- ✅ An architectural issue: ConsultlyWidget needs to be embedded WITHIN a Wix page context
- ✅ When opened via ngrok directly, it has NO Wix context to pass
- ✅ When embedded in Wix App Page, Wix PROVIDES the context automatically

---

## 📊 COMPARISON

| Aspect | Public Widget (index.js) | Consultly Widget (consultly-widget.js) |
|--------|--------------------------|----------------------------------------|
| **Entry Point** | `src/index.js` | `src/consultly-widget.js` |
| **Custom Element** | `<consultant-widget>` | `<consultly-widget>` |
| **Instance Handling** | ✅ Gets from attribute | ❌ Doesn't handle |
| **Wix Integration** | ✅ Full (bridge, resizer, modes) | ❌ None |
| **Can open via ngrok** | ❌ Also needs Wix context | ❌ Also needs Wix context |
| **Must be on Wix page** | ✅ Yes | ✅ Yes |

---

## ✅ CURRENT WORKING SETUP (Public Widget)

**How existing public widget works on Wix:**

```
1. Merchant drags <consultant-widget> onto a Wix page
2. Wix automatically:
   - Sets instance attribute
   - Provides URL params with wixDbId
   - Wraps in iframe with height management
   - Sends postMessage events
   
3. Widget receives all Wix context automatically
4. WixInstanceGuard passes ✅
5. App loads successfully ✅
```

---

## 🎯 CONSULTLY NEEDS SAME SETUP

**For Consultly to work on Wix:**

```
1. Create Wix App Page for "Consultly"
2. Configure it to render <consultly-widget>
3. When customer visits "Consultly" page:
   - Wix provides instance attribute
   - Wix provides URL params
   - Wix wraps in iframe
   - Same context as public widget
   
4. ConsultlyWidget works ✅
```

---

## 🚀 NEXT STEP

Create a Wix App Page extension that:
1. Automatically creates a "Consultly" page on installation
2. Embeds the `<consultly-widget>` on that page
3. Passes instance attribute to the widget
4. Result: Customer clicks "Consultly" → Page loads → Widget receives Wix context

