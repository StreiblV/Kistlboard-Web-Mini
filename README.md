# Kistlboard Web Mini

This repository contains the frontend / web application for **Kistlboard Mini**.

Kistlboard Mini is a small, self-hostable version of Kistlboard.

This web application displays the content managed through the CMS and provides the user-facing interface of the project.

This repository is part of the full Kistlboard Mini setup:

* **Kistlboard CMS Mini** – backend / CMS
* **Kistlboard Web Mini** – frontend / web application

For the full project setup, please check the main `Kistlboard-Mini` repository.

---

## Requirements

Before starting the project, make sure you have the following installed:

* Node.js
* pnpm
* Git

You will also need a running Kistlboard CMS instance.

---

## Local Setup

### 1. Clone the Repository

If you are using this repository directly:

```bash
git clone https://github.com/YOUR-USERNAME/Kistlboard-Web-Mini.git
cd Kistlboard-Web-Mini
```

If you cloned the full `Kistlboard-Mini` repository with submodules, change into the web folder instead:

```bash
cd web
```

---

### 2. Install Dependencies

```bash
pnpm install
```

---

### 3. Start the CMS

Before starting the web application, make sure the **Kistlboard CMS Mini** is running.

By default, the CMS is expected to be available at:

```text
http://localhost:3000
```

Please check the `Kistlboard-CMS-Mini` README for the CMS setup instructions.

---

### 4. Start the Development Server

```bash
pnpm start
```

or:

```bash
ng serve
```

Once the server is running, open:

```text
http://localhost:4200
```

The application will automatically reload whenever you modify the source files.

---

## CMS Connection

This frontend requires a running Kistlboard CMS instance.

By default, the CMS is expected to run at:

```text
http://localhost:3000
```

If you change the CMS host or port, make sure to update the CMS/API URL inside the web application accordingly.

---

## Build for Production

To create a production build:

```bash
pnpm build
```

or:

```bash
ng build
```

The build output will be generated inside the `dist/` directory.

---

## Project Structure

```text
Kistlboard-Web-Mini/
├── src/              # Application source code
├── public/           # Static assets
├── package.json      # Project scripts and dependencies
└── README.md
```

---

## Available Scripts

Install dependencies:

```bash
pnpm install
```

Start the local development server:

```bash
pnpm start
```

Run tests:

```bash
pnpm test
```

Create a production build:

```bash
pnpm build
```

---

## Deployment

For a complete deployment, you will need:

* a running PostgreSQL database
* Kistlboard CMS Mini
* Kistlboard Web Mini
* properly configured CMS environment variables

Please refer to the main `Kistlboard-Mini` repository for the complete setup instructions.

---

## License

This project is licensed under the MIT License.

See the `LICENSE` file for more information.

---

## Author

Created by **Contentkistl / StreiblV**.
