## 📂 Project Structure (โครงสร้างโปรเจกต์)

โครงสร้างไฟล์หลักของระบบเช็คชื่อนักเรียน (Student Attendance System):

```text
├── public/              # ไฟล์ที่เข้าถึงได้โดยตรง (เช่น Favicon, Images)
├── src/                 # ซอร์สโค้ดหลักของแอปพลิเคชัน
│   ├── assets/          # ไฟล์ Static เช่น รูปภาพ, SVG, CSS
│   ├── components/      # Component ส่วนกลางที่ใช้ซ้ำ (เช่น Navbar)
│   ├── pages/           # หน้าหลักของระบบ (Pages)
│   │   ├── Home.jsx            # หน้าแรก
│   │   ├── Dashboard.jsx       # หน้าสรุปผล/ภาพรวม
│   │   ├── CheckIn.jsx         # หน้าสำหรับเช็คชื่อ
│   │   ├── CheckInHistory.jsx  # หน้าประวัติการเช็คชื่อ
│   │   ├── StudentManager.jsx  # หน้าจัดการข้อมูลนักเรียน
│   │   ├── EditSchedule.jsx    # หน้าแก้ไขตารางเรียน
│   │   └── DepositManager.jsx  # หน้าจัดการการฝากเงิน (ถ้ามี)
│   ├── firebase.js      # ไฟล์ตั้งค่าการเชื่อมต่อ Firebase
│   ├── App.jsx          # จุดเริ่มต้นของ Routing และ Layout หลัก
│   └── main.jsx         # ไฟล์หลักที่ใช้ Render แอป React
├── .env                 # ไฟล์เก็บค่า Config (API Keys) *สำคัญมาก*
├── .gitignore           # ไฟล์ระบุชื่อไฟล์/โฟลเดอร์ที่ไม่ต้องการ Push ขึ้น Git
├── index.html           # ไฟล์ HTML หลักที่เป็น Template
├── package.json         # ไฟล์ระบุ Libraries ที่โปรเจกต์ต้องใช้
└── vite.config.js       # ไฟล์ตั้งค่าของ Vite


