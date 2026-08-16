# 🎬 Stash-Chilorr

Stash-Chilorr is a customized frontend built with React (Vite) and an automated background launcher for the Stash Server. This project revamps the default Stash UI using Tailwind CSS and includes scripts to package the entire application into a single, clean executable (`.exe`) file that runs silently in your taskbar.

## ✨ Features
* **Custom UI:** A modernized, sleek gallery and video player interface using React and Tailwind CSS.
* **One-Click Launcher:** Start both the Stash backend and the Node.js bridge server simultaneously with a single executable.
* **Background Process:** Runs cleanly in the background (minimized to the taskbar) without annoying CMD windows.
* **Auto-Close:** Built-in tracker that automatically kills the Node.js background processes the moment you close the Stash program from your taskbar.

---

## 📂 Directory Structure

* **`/src` & `/public`**: Source code for the frontend application (React, Vite, Tailwind CSS).
* **`/sever js`**: Contains the Node.js bridge server (`server.js`) required to connect the custom frontend with the Stash API.
* **`/bat`**: Contains the raw Batch (`.bat`) scripts used to compile the application into a standalone `.exe`.
* **`/icon`**: Icon assets (`.ico`) used for the launcher application.

---

## 🚀 Installation & Usage (For End-Users)

If you just want to run the application without messing with the source code, download the pre-compiled release:

1. Navigate to the **[Releases](../../releases)** page of this repository.
2. Download the latest `Stash-Chilorr-vX.X.zip` file.
3. Extract the `.zip` file anywhere on your computer.
4. Double-click **`Stash-Chillor.exe`** to launch the application.
5. The server will run in the background (you will see an icon in your taskbar), and your default web browser will automatically open the application.
6. **To Stop:** Right-click the Stash icon in your taskbar and select **Close window**. The script will automatically terminate all related background processes safely.

---

## 🛠️ Developer Guide (Building from Source)

### Prerequisites
* [Node.js](https://nodejs.org/) installed on your machine.
* The original Stash Server executable (`stash-win.exe`).

### 1. Local Development Setup
Clone this repository and install the required frontend dependencies:

```bash
git clone [https://github.com/your-username/stash-chilorr.git](https://github.com/your-username/stash-chilorr.git)
cd stash-chilorr
npm install
## 2. Running the Frontend (Development Mode)

Start the Vite development server:

```bash
npm run dev
```

## 3. Running the Node.js Bridge Server

Open a separate terminal window, navigate to the `sever js` folder, and start the bridge server:

```bash
cd "sever js"
node server.js
```

> **Note:** Ensure your `stash-win.exe` is already running manually so the API can connect.

## 📦 Building for Production & Compiling the EXE

To create the final release version that end-users can run:

1. **Build Frontend:** Run `npm run build` in the root directory. This will generate a `/dist` folder containing the production-ready UI files.
2. **Setup Release Folder:** Create a new folder for your release. Move the contents of `/dist` into a `frontend` folder, place `stash-win.exe` in a `backend` folder, and include your `server.js`.
3. **Compile EXE:**
   - Open the **Bat To Exe Converter** application.
   - Load the script provided in the `/bat` folder.
   - Attach the icon from the `/icon` folder.
   - Set the **Exe-Format** option to `64 Bit | Windows (Invisible)` to ensure it runs silently in the background.
   - Click **Convert** to generate your `Stash-Chillor.exe`.
