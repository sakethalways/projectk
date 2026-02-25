**PROJECT REQUIREMENT – NEW FEATURE: Tourist to Local Guide Booking System**

We are adding a complete booking feature that connects tourists with local guides.

### 1. Tourist Side – Explore Guides Page
- On every guide card, add a **“Book Guide”** button.
- When the tourist clicks “Book Guide”:
  1. Check if the guide is **on leave**.
     - If the guide is on leave → Show message: **“Guide is on leave. Please try another guide.”** and stop the process.
     - If the guide is available → Open a booking popup.
  2. In the popup:
     - First, let the tourist **select a date** from the guide’s available dates only.
     - After date selection, show all **itineraries** provided by that guide and let the tourist select **one itinerary**.
     - After itinerary selection, display:
       - Selected date
       - Itinerary price
       - Confirmation message exactly as:  
         **“Hey [Tourist Name], are you sure to confirm booking on [Selected Date] to [Guide Location] with [Guide Name] at a price [Itinerary Amount]?”**
     - Show two buttons: **Confirm** and **Cancel**.
  3. If tourist clicks **Confirm** → Send booking request to the guide.
  4. If tourist clicks **Cancel** → Close popup and stop the booking process.

### 2. Tourist Sidebar – Booking Status Section
- Create a new section in the tourist sidebar called **“Booking Status”**.
- This page will show **all booking requests** the tourist has sent to different guides.

### 3. Guide Side – Booking Requests Section
- Create a new section for guides called **“Booking Requests”**.
- Show every tourist trip request with the following details:
  - Tourist name
  - Tourist phone number
  - Location
  - Selected itinerary
  - Selected date
- For each request, show two buttons: **Accept** and **Reject**.

**Actions:**
- **If guide clicks Accept**:
  - Booking moves to guide’s **“Confirmed Bookings”** section.
  - Tourist’s “Booking Status” updates to **“Accepted”**.
- **If guide clicks Reject**:
  - Show a confirmation popup: **“Are you sure you want to reject this booking?” (Yes / No)**.
  - If Yes → Cancel the request, remove it from guide’s UI, and update tourist’s “Booking Status” to **“Rejected”**.

### 4. Tourist Actions on Their Bookings
- **Rejected bookings**: Tourist can **delete** them (with confirmation). Once deleted, remove from UI and database.
- **Before guide approval**: Tourist can **cancel** the booking request (with confirmation popup). If cancelled, remove the request from **both** tourist and guide dashboards.
- **After guide approval** (in Confirmed Bookings):
  - Tourist can still **cancel** the booking (with confirmation).
  - Guide will see the cancellation in their “Confirmed Bookings” section.
  - Guide only needs to click **“Okay”** (no other action).
  - After guide clicks Okay, remove the booking from **both** dashboards.

### 5. Trip Completion
- After the selected date passes, guide can click **“Trip Completed”** on the confirmed booking.
- Once clicked:
  - Booking moves to **“Past Bookings”** section for **both** tourist and guide.

### 6. Guide Dashboard Sections (New)
- **Booking Requests** (as described above)
- **Confirmed Bookings**
- **Past Bookings**

### 7. Admin Dashboard Updates
- When a booking is **accepted** by guide → Show it in **“Active Bookings”** section.
- When guide marks **“Trip Completed”** → Move it to **“Past Bookings”** section in admin.
- If booking is **cancelled** at any stage → Remove it completely from admin UI.
- Admin can view full details of any accepted or past booking, including:
  - Tourist full details
  - Guide full details
  - Complete trip information (date, itinerary, price, location, etc.)

---

**Additional Rules (must be followed):**
- All cancellations and rejections must have confirmation popups.
- Once a booking is moved to Past Bookings, it stays there (no further cancellation).
- Guide availability / on-leave status must be checked before opening the booking popup.
- All status changes (Pending → Accepted → Confirmed → Cancelled → Completed → Past) must update in real-time on both tourist and guide dashboards.

create a perfect sql code and backend logic to make these features run in real time . give me correct sql code to run in supabase