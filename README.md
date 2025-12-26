# **BoloForms Assessment**

This project is a **PDF Editor and Signing Platform** with a **responsive drag-and-drop editor**, a backend for **burning signatures into PDFs**, and an **audit trail** for security.

## **Table of Contents**

- Project Overview
- Phase 1 - Frontend (Responsive PDF Editor)
- Phase 2 - Backend (Burn-In Engine)
- Phase 3 - Security Layer (Audit Trail)
- Local Setup Instructions
- Environment Variables
- Usage

## **Project Overview**

The project consists of **three main components**:

- **Frontend:** A responsive PDF editor where users can drag and drop various fields (Text, Signature, Image, Date, Radio) and place them on a PDF. The placement is **responsive**, i.e., anchored correctly across different screen sizes.
- **Backend:** Receives requests from the frontend to "burn" signatures or images onto PDFs while maintaining aspect ratio.
- **Security Layer:** Tracks document integrity by calculating **SHA-256 hashes** of the original and signed PDFs and stores them in **MongoDB** for an audit trail.

## **Phase 1 - Frontend (Responsive PDF Editor)**

**Tech Stack:** React.js, PDF.js (react-pdf)

**Features:**

- Display a sample PDF (A4 format).
- Drag and drop fields:
  - Text Box
  - Signature Field
  - Image Box
  - Date Selector
  - Radio Button
- Resize fields dynamically.
- Fields are **responsive**: anchored correctly across desktop and mobile screen sizes.
- Users can sign documents and use the dropped fields.

**Notes:**

- Coordinates are stored as **percentage values** of the PDF page (xPct, yPct, wPct, hPct) to ensure responsiveness.
- Dragging, resizing, and double-click to edit features are implemented using **react-rnd**.

## **Phase 2 - Backend (Burn-In Engine)**

**Tech Stack:** Node.js, Express, pdf-lib, MongoDB

**Endpoint:**

POST /sign-pdf

**Payload:**
```
{
  "pdfBase64": "<PDF file as base64>",
  "signature": "<Signature Image Base64>",
  "coordinates": {
    "xPct": 0.42,
    "yPct": 0.31,
    "wPct": 0.25,
    "hPct": 0.08,
    "page": 1
  }
}

```


**Processing:**

- Load PDF from base64.
- Load signature image from base64.
- Calculate the **placement**:
  - Box width/height is percentage of page width/height.
  - Signature is centered inside the box while maintaining **aspect ratio**.
- Overlay the signature onto the PDF.
- Save the signed PDF and return a URL or base64 for frontend.

## **Phase 3 - Security Layer (Audit Trail)**

**Purpose:** To maintain a record of document history and integrity.

**Processing Steps:**

- **Before signing:**
  - Calculate **SHA-256 hash** of the original PDF.
- **After signing:**
  - Calculate **SHA-256 hash** of the signed PDF.
- Store both hashes in **MongoDB** with PDF metadata to create an **audit trail**.

## **Local Setup Instructions**

### **Prerequisites**

- Node.js ≥ 18
- npm ≥ 9
- MongoDB (local or Atlas)
- A sample PDF for testing

### **Backend Setup**

- Navigate to the backend folder:
```
cd backend
```
- Install dependencies:
```
npm install
```
- Create a .env file in backend:
```
MONGO_URI=&lt;your-mongodb-uri&gt;

PORT=4000
```
- Start the backend server:
```
node index.js
```
The backend will be running at <http://localhost:4000>.

### **Frontend Setup**

- Navigate to the frontend folder:
```
cd frontend
```
- Install dependencies:
```
npm install
```
- Start the frontend server:
```
npm start
```
The frontend will be running at <http://localhost:3000>.

### **MongoDB Setup**

- Use MongoDB Atlas or local MongoDB.
- Store documents in a collection named pdf_hashes with fields:
```
{
  "pdfId": "<unique-pdf-id>",
  "originalHash": "<SHA-256 hash>",
  "signedHash": "<SHA-256 hash>",
  "createdAt": "<timestamp>"
}

```
## **Usage**

- Open frontend: <http://localhost:3000>.
- Drag and drop fields onto the PDF.
- Edit fields as needed.
- Click **Burn Signature** to send the request to backend.
- Backend overlays signatures/images and returns the signed PDF.
- Audit trail hashes are saved in MongoDB.

## **Notes**

- All coordinates (xPct, yPct, wPct, hPct) are **percentages of the page size** to ensure responsiveness.
- Signature aspect ratio is preserved while fitting within the box.
- React-RND is used for drag, resize, and anchoring fields.
- PDF-Lib handles PDF manipulation and embedding images.