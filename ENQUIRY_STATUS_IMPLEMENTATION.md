# Enquiry Status & Resolution Method Implementation

**Project:** OCBC SmartHelp Portal  
**Date:** January 19, 2026  
**Status:** Implementation Plan

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Status Lifecycle](#status-lifecycle)
3. [Resolution Methods](#resolution-methods)
4. [Implementation Details](#implementation-details)
5. [Service Flows](#service-flows)
6. [Database Schema](#database-schema)
7. [Implementation Checklist](#implementation-checklist)
8. [Demo Presentation Guide](#demo-presentation-guide)

---

## Overview

This document outlines the enquiry status tracking and resolution method implementation for the OCBC SmartHelp Portal. The system tracks customer enquiries from creation through resolution, with different resolution paths based on the service used.

### Key Principles

- **Simple Status Tracking**: Only 4 statuses (submitted, in-progress, resolved, inactive)
- **Clear Resolution Methods**: 3 methods aligned with services (self-service, agent-online, agent-physical)
- **Customer Self-Marking**: Only for tutorials (immediate feedback)
- **Agent Marking**: For QR/queue/callback (resolution happens later)

---

## Status Lifecycle

### Status Flow Diagram

```
submitted → in-progress → resolved
                       ↓
                    inactive (after 10 days)
```

### Status Definitions

| Status | Description | When It Happens | Triggered By |
|--------|-------------|-----------------|--------------|
| **submitted** | Enquiry just created, awaiting action | User completes category + subcategory selection | `createEnquiry()` |
| **in-progress** | Customer is actively trying to resolve | User starts ANY service (tutorial, QR, queue, callback) | `startService()` |
| **resolved** | Issue has been fixed/answered | Customer/agent confirms resolution | `completeService()` |
| **inactive** | Enquiry abandoned, no activity for 10+ days | Auto-marked if still in submitted status | Cron job (optional) |

### Status Transition Rules

> **submitted** → Can only move to **in-progress**

> **in-progress** → Can move to **resolved** OR stay in-progress

> **resolved** → Final state (no further changes)

> **inactive** → Final state (no further changes)

---

## Resolution Methods

### Method Definitions

| Method | Service Type | Who Marks | Timing | Implementation |
|--------|-------------|-----------|---------|----------------|
| **self-service** | Self-service tutorials | Customer | Immediate (after viewing tutorial) | ✅ Full implementation |
| **agent-online** | Online queue / Callback | Agent | After call/chat with customer | ⏳ Structure prepared |
| **agent-physical** | Physical branch (QR code) | Branch agent | After in-person consultation | ⏳ Structure prepared |

### Why Different Timings?

**Self-Service (Immediate):**
- Customer views tutorial → Tries solution → Knows RIGHT NOW if it helped
- Can immediately mark as resolved

**Agent Services (Later):**
- Customer generates QR → Resolution happens LATER at branch
- Customer joins queue → Agent calls LATER
- Customer schedules callback → Call happens LATER
- Cannot self-mark until service is delivered

---

## Implementation Details

### 1. New Functions in enquiryService.js

#### startService()

**Purpose:** Move enquiry from `submitted` to `in-progress`

**When Called:** User starts any service (tutorial, QR, queue, callback)

```javascript
/**
 * Mark enquiry as in-progress when user starts a service
 */
export async function startService(enquiryId) {
  try {
    const { data, error } = await supabase
      .from("enquiry")
      .update({
        status: "in-progress"
      })
      .eq("enquiry_id", enquiryId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Start service error:", error);
    throw error;
  }
}
```

#### completeService()

**Purpose:** Mark enquiry as `resolved` with resolution method

**When Called:** Customer/agent confirms resolution

```javascript
/**
 * Mark enquiry as resolved with specified resolution method
 */
export async function completeService(enquiryId, resolutionMethod) {
  try {
    const { data, error } = await supabase
      .from("enquiry")
      .update({
        status: "resolved",
        resolution_method: resolutionMethod
      })
      .eq("enquiry_id", enquiryId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Complete service error:", error);
    throw error;
  }
}
```

#### markInactiveEnquiries() (Optional)

**Purpose:** Auto-mark old enquiries as inactive

**When Called:** Cron job (daily/weekly)

```javascript
/**
 * Auto-mark enquiries as inactive after 10 days of no activity
 * Should be run as a scheduled job
 */
export async function markInactiveEnquiries() {
  try {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    
    const { data, error } = await supabase
      .from("enquiry")
      .update({ status: "inactive" })
      .eq("status", "submitted")
      .lt("created_at", tenDaysAgo)
      .select();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Mark inactive error:", error);
    throw error;
  }
}
```

---

### 2. Update getEnquiryHistory()

**Purpose:** Show only resolved enquiries with valid resolution methods

```javascript
/**
 * Get customer's enquiry history
 * Only shows resolved enquiries with valid resolution methods
 */
export async function getEnquiryHistory(customerId, limit = 10) {
  try {
    const validMethods = ["self-service", "agent-online", "agent-physical"];
    
    const { data, error } = await supabase
      .from("enquiry")
      .select("*")
      .eq("customer_id", customerId)
      .eq("status", "resolved")
      .in("resolution_method", validMethods)
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get enquiry history error:", error);
    return [];
  }
}
```

**Policy:** Only enquiries resolved by valid methods appear in history

---

## Service Flows

### Flow 1: Self-Service Tutorial (✅ Full Implementation)

#### User Journey
1. User selects category + subcategory → Enquiry created (`submitted`)
2. User clicks "View Tutorial" → Status changes to `in-progress`
3. Chatbot displays tutorial steps
4. Chatbot asks: "Did this tutorial resolve your issue?"
5. User clicks "Yes, Issue Resolved" → Status: `resolved`, Method: `self-service`
6. Enquiry appears in history

#### Code Implementation

**In chatbotController.js:**

```javascript
// When user selects "View Tutorial"
if (action === "view_tutorial") {
  // Move enquiry to in-progress
  await startService(flowState.enquiryId);
  
  // Show tutorial content
  const tutorial = getTutorialContent(flowState.category, flowState.subcategory);
  
  response.message = `Here's how to resolve your issue:\n\n${tutorial}\n\nDid this tutorial resolve your issue?`;
  
  response.options = [
    { text: "Yes, Issue Resolved ✓", value: "tutorial_resolved" },
    { text: "No, Still Need Help", value: "need_more_help" }
  ];
  
  response.suggestedAction = "confirm_tutorial";
}

// Handle customer confirmation
if (action === "confirm_tutorial") {
  if (userChoice === "tutorial_resolved") {
    await completeService(flowState.enquiryId, "self-service");
    
    response.message = "Great! Your enquiry has been marked as resolved. " +
      "Thank you for using OCBC SmartHelp!";
    
    // Reset flow
    response.flowState = {};
  } else if (userChoice === "need_more_help") {
    // Keep in-progress, offer other options
    response.message = "I understand. Let me help you in another way.";
    response.options = [
      { text: "Physical Consultation", value: "physical_consultation" },
      { text: "Online Agent Support", value: "online_agent" }
    ];
  }
}
```

#### Tutorial Content Helper

```javascript
/**
 * Get tutorial content based on category and subcategory
 */
function getTutorialContent(category, subcategory) {
  const tutorials = {
    "Report Lost Card": `
Step 1: Open your OCBC mobile banking app
Step 2: Navigate to 'Card Services' section
Step 3: Select 'Report Lost/Stolen Card'
Step 4: Choose the affected card
Step 5: Confirm blocking and request replacement
Step 6: You'll receive confirmation via SMS

Note: Your replacement card will arrive in 3-5 business days.
    `,
    "Manage Card Limit": `
Step 1: Log into OCBC mobile banking
Step 2: Go to 'Cards' → Select your card
Step 3: Tap 'Card Limits'
Step 4: Adjust daily transaction limit
Step 5: Enter OTP to confirm changes

Current limits:
- ATM Withdrawal: $2,000/day
- Online Shopping: $5,000/day
- Overseas: $10,000/day
    `,
    // Add more tutorials as needed
  };
  
  return tutorials[subcategory] || "Tutorial content not available.";
}
```

---

### Flow 2: Physical Consultation (QR Code) (⏳ Structure Prepared)

#### User Journey
1. User selects category + subcategory → Enquiry created (`submitted`)
2. User clicks "Physical Consultation" → Selects branch → QR generated
3. Status changes to `in-progress`
4. **[Future]** User visits branch, shows QR code
5. **[Future]** Agent scans QR, helps customer
6. **[Future]** Agent clicks "Mark Resolved" → Status: `resolved`, Method: `agent-physical`

#### Code Implementation

**In consultationService.js:**

```javascript
export async function generateConsultationQR(customerId, enquiryId, preferredBranch) {
  try {
    // Generate unique consultation ID
    const timestamp = Date.now().toString().slice(-4);
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
    const consultationId = `ENQ-${timestamp}-${randomPart}`;
    
    // Generate QR code...
    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, { ... });
    
    // Insert consultation record...
    const { data, error } = await supabase.from("consultations").insert([{ ... }]);
    
    // ✅ Mark enquiry as in-progress
    await startService(enquiryId);
    
    // TODO: Agent dashboard will later call:
    // await completeService(enquiryId, "agent-physical");
    
    return {
      success: true,
      consultationId,
      qrCode: qrCodeDataUrl,
      branch: preferredBranch
    };
  } catch (error) {
    console.error("Generate QR error:", error);
    throw error;
  }
}
```

**For Demo:**
> "In production, when the branch agent finishes helping the customer, they would click 'Mark as Resolved' in their dashboard, which calls `completeService(enquiryId, 'agent-physical')`"

---

### Flow 3: Online Queue (⏳ Structure Prepared)

#### User Journey
1. User selects category + subcategory → Enquiry created (`submitted`)
2. User clicks "Online Agent Support" → Joins queue
3. Status changes to `in-progress`
4. **[Future]** Agent picks up from queue, calls customer
5. **[Future]** Agent helps customer resolve issue
6. **[Future]** Agent clicks "Mark Resolved" → Status: `resolved`, Method: `agent-online`

#### Code Implementation

**In queueService.js:**

```javascript
export async function joinQueue(customerId, enquiryId, category, subcategory) {
  try {
    // Get current queue position
    const { data: queueData } = await supabase
      .from("queue_entries")
      .select("position")
      .order("position", { ascending: false })
      .limit(1);
    
    const newPosition = queueData?.[0]?.position + 1 || 1;
    
    // Add to queue
    const { data, error } = await supabase
      .from("queue_entries")
      .insert([{
        customer_id: customerId,
        enquiry_id: enquiryId,
        position: newPosition,
        status: "waiting"
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // ✅ Mark enquiry as in-progress
    await startService(enquiryId);
    
    // TODO: Agent dashboard will later call:
    // await completeService(enquiryId, "agent-online");
    
    return {
      success: true,
      position: newPosition,
      estimatedWaitTime: newPosition * 5  // 5 min per customer
    };
  } catch (error) {
    console.error("Join queue error:", error);
    throw error;
  }
}
```

**For Demo:**
> "After the agent finishes the call and confirms the issue is resolved, they click 'Mark as Resolved' which calls `completeService(enquiryId, 'agent-online')`"

---

### Flow 4: Callback (⏳ Structure Prepared)

#### User Journey
1. User selects category + subcategory → Enquiry created (`submitted`)
2. User clicks "Schedule Callback" → Selects time slot
3. Status changes to `in-progress`
4. **[Future]** Agent calls customer at scheduled time
5. **[Future]** Agent helps resolve issue
6. **[Future]** Agent clicks "Mark Resolved" → Status: `resolved`, Method: `agent-online`

#### Code Implementation

**In queueService.js:**

```javascript
export async function scheduleCallback(customerId, enquiryId, scheduledTime) {
  try {
    // Create callback record
    const { data, error } = await supabase
      .from("callbacks")
      .insert([{
        customer_id: customerId,
        enquiry_id: enquiryId,
        scheduled_time: scheduledTime,
        status: "pending"
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // ✅ Mark enquiry as in-progress
    await startService(enquiryId);
    
    // TODO: Agent dashboard will later call:
    // await completeService(enquiryId, "agent-online");
    
    return {
      success: true,
      callbackId: data.id,
      scheduledTime: scheduledTime
    };
  } catch (error) {
    console.error("Schedule callback error:", error);
    throw error;
  }
}
```

**For Demo:**
> "After completing the callback and resolving the customer's issue, the agent marks it as resolved by calling `completeService(enquiryId, 'agent-online')`"

---

## Database Schema

### Current Enquiry Table

**No changes needed!** Your existing schema already supports this implementation.

```sql
CREATE TABLE enquiry (
  enquiry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(customer_id),
  category_id UUID REFERENCES enquiry_category(enquiry_category_id),
  description TEXT,
  image_url TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'open',          -- Will use: submitted, in-progress, resolved, inactive
  resolution_method TEXT,              -- self-service, agent-online, agent-physical, NULL
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### Status Values Update

**Change default value from 'open' to 'submitted':**

```sql
-- Optional: Update default value in database
ALTER TABLE enquiry ALTER COLUMN status SET DEFAULT 'submitted';

-- Update existing records (if any)
UPDATE enquiry SET status = 'submitted' WHERE status = 'open';
```

---

## Implementation Checklist

### Phase 1: Core Functions (Required)

- [ ] **enquiryService.js** - Add `startService()` function
- [ ] **enquiryService.js** - Add `completeService()` function
- [ ] **enquiryService.js** - Update `getEnquiryHistory()` to filter resolved only
- [ ] **enquiryService.js** - Update `createEnquiry()` to use status: `submitted`

### Phase 2: Self-Service Tutorial (Full Implementation)

- [ ] **chatbotController.js** - Add tutorial content helper function
- [ ] **chatbotController.js** - Implement "View Tutorial" flow
- [ ] **chatbotController.js** - Add confirmation dialog after tutorial
- [ ] **chatbotController.js** - Handle "tutorial_resolved" action
- [ ] **chatbotController.js** - Handle "need_more_help" action
- [ ] Test end-to-end tutorial flow

### Phase 3: QR Code Preparation

- [ ] **consultationService.js** - Add `startService()` call in `generateConsultationQR()`
- [ ] **consultationService.js** - Add TODO comment for agent completion
- [ ] Test QR generation moves enquiry to in-progress

### Phase 4: Queue Preparation

- [ ] **queueService.js** - Add `startService()` call in `joinQueue()`
- [ ] **queueService.js** - Add TODO comment for agent completion
- [ ] Test joining queue moves enquiry to in-progress

### Phase 5: Callback Preparation

- [ ] **queueService.js** - Add `startService()` call in `scheduleCallback()`
- [ ] **queueService.js** - Add TODO comment for agent completion
- [ ] Test scheduling callback moves enquiry to in-progress

### Phase 6: Optional (Future)

- [ ] **enquiryService.js** - Add `markInactiveEnquiries()` function
- [ ] Set up cron job to run `markInactiveEnquiries()` daily
- [ ] Create agent dashboard (separate project phase)
- [ ] Implement agent authentication
- [ ] Build agent completion endpoints

---

## Demo Presentation Guide

### What to Demonstrate (Live)

#### 1. Self-Service Tutorial Flow (Fully Functional)

**Demo Script:**
1. Login as customer
2. Open chatbot, select "Card Services" → "Report Lost Card"
3. Click "View Tutorial" → Show tutorial steps
4. Answer "Yes, Issue Resolved"
5. **Show:** Status changed to `resolved`, method: `self-service`
6. **Show:** Enquiry appears in history

**Key Points:**
- ✅ Customer can immediately confirm resolution
- ✅ Tutorial provides instant value
- ✅ Full workflow from creation to resolution

#### 2. QR Code Generation (Partial - In Progress)

**Demo Script:**
1. Select "Physical Consultation"
2. Choose branch location
3. Generate QR code
4. **Show:** Status changed to `in-progress`

**What to Explain:**
> "The customer would now visit the selected branch and show this QR code. The branch agent would scan it, see the customer's enquiry details, and after helping the customer, mark it as resolved in their dashboard."

**Show in Code:**
```javascript
// In consultationService.js (line XX)
// TODO: Agent dashboard will call this after helping customer:
// await completeService(enquiryId, "agent-physical");
```

#### 3. Queue System (Partial - In Progress)

**Demo Script:**
1. Select "Online Agent Support"
2. Join queue
3. **Show:** Queue position and estimated wait time
4. **Show:** Status changed to `in-progress`

**What to Explain:**
> "The customer is now in the queue. When their turn comes, an agent from our support team would pick up the call from their dashboard, help resolve the issue, and then mark it as resolved."

**Show in Code:**
```javascript
// In queueService.js (line XX)
// TODO: Agent dashboard will call this after the call:
// await completeService(enquiryId, "agent-online");
```

---

### What to Explain (Not Demonstrated)

#### Agent Dashboard (Not Built)

**Explanation:**
> "In a production environment, we would have an agent dashboard where support staff and branch agents can:
> - View incoming enquiries
> - See customer details and enquiry history
> - Mark enquiries as resolved after helping
> - Track their performance metrics"

**Show Architecture:**
- Point to TODO comments in code
- Show `completeService()` function that agents would call
- Explain the separation of customer-facing vs agent-facing systems

#### Auto-Inactive Marking (Not Implemented)

**Explanation:**
> "For enquiries that remain in 'submitted' status for more than 10 days, we've designed a function that would automatically mark them as 'inactive'. This keeps the database clean and helps identify enquiries that may need follow-up."

**Show in Code:**
```javascript
// Point to markInactiveEnquiries() function
// Explain it would run as a scheduled job
```

---

### Handling Q&A

**Q: "How do you know if the customer actually resolved their issue?"**

**A:** 
- For tutorials: Customer explicitly confirms "Yes, Issue Resolved"
- For agent services: Agent confirms with customer during call/visit before marking
- This creates accountability and accurate tracking

**Q: "What if a customer lies and says it's resolved but it's not?"**

**A:**
- We track resolution methods, so we can identify patterns
- If many self-service resolutions lead to repeat enquiries, we know tutorials need improvement
- Agent-based resolutions have human verification

**Q: "Why not mark everything as resolved automatically?"**

**A:**
- That would pollute our history with unsolved issues
- We want accurate metrics: only truly resolved issues in history
- Helps identify which services are most effective

**Q: "What about the 10-day inactive rule?"**

**A:**
- Applies only to 'submitted' status (customer created enquiry but took no action)
- Once customer starts a service (in-progress), we don't auto-mark inactive
- Helps distinguish between abandoned enquiries and active ones

---

## Summary

### What We're Building

| Component | Status | Deliverable |
|-----------|--------|-------------|
| Status lifecycle (4 states) | ✅ Ready | Tracking from creation to resolution |
| Resolution methods (3 types) | ✅ Ready | Self-service, agent-online, agent-physical |
| Self-service tutorial flow | ✅ Full implementation | Customer can resolve immediately |
| QR code / Queue / Callback | ⏳ Structure prepared | Status tracking ready, agent marking pending |
| Enquiry history | ✅ Full implementation | Shows only resolved with valid methods |
| Agent dashboard | ❌ Not in scope | Future phase, structure prepared |

### Key Achievements

1. **Clear Status Progression**: Every enquiry has a defined lifecycle
2. **Accurate Resolution Tracking**: Know exactly how issues were resolved
3. **Clean History**: Only truly resolved enquiries appear in history
4. **Scalable Design**: Easy to add agent dashboard later
5. **Demo-Ready**: Tutorial flow fully functional, other services prepared

### Next Steps After Demo

1. Build agent dashboard
2. Implement agent authentication
3. Add performance metrics and analytics
4. Set up auto-inactive cron job
5. Add timestamp tracking for resolution times

---

**Document Version:** 1.0  
**Last Updated:** January 19, 2026  
**Author:** Development Team  
**Status:** Ready for Implementation
