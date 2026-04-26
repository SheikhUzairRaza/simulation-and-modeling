# Queueing Model and Simulator - Project Analysis

This document provides a comprehensive overview of the project's structure, architecture, and functional workflow.

## 🚀 Project Overview
The **Queueing Model and Simulator** is a full-stack application designed to analyze and compute performance metrics for queueing systems. It currently supports the **M/M/1** queueing model (Poisson arrivals, exponential service times, and a single server).

## 🏗️ Architecture
The project follows a modern client-server architecture:
- **Frontend:** A responsive Next.js web application.
- **Backend:** An ASP.NET Core Web API that handles mathematical computations.
- **Communication:** The frontend communicates with the backend via RESTful JSON endpoints.

---

## 🛠️ Backend Structure (ASP.NET Core API)
Located in the `/backend` directory, the API is built using .NET 8.0/10.0.

### Key Components:
- **`Program.cs`**: The entry point. Configures services, CORS policy (AllowAll for development), and the middleware pipeline.
- **`Controllers/SimulationController.cs`**: 
    - Exposes the `POST api/simulation/mm1` endpoint.
    - Validates incoming requests and delegates computation to the `MM1Service`.
- **`Services/MM1Service.cs`**: 
    - Contains the core mathematical logic for the M/M/1 model.
    - **Logic:** Converts mean interarrival/service times into rates ($\lambda$ and $\mu$), checks for system stability ($\rho < 1$), and calculates metrics like Average Number in Queue ($L_q$), Average Wait Time ($W_q$), etc.
- **`Models/`**: 
    - `MM1Request.cs`: Defines the input parameters (Interarrival Time, Service Time).
    - `MM1Response.cs`: Defines the output metrics returned to the client.

---

## 🎨 Frontend Structure (Next.js)
Located in the `/frontend` directory, the UI is built with React, TypeScript, and Tailwind CSS.

### Key Components:
- **`src/app/page.tsx`**: The main dashboard. Manages state for inputs, simulation results, and UI transitions.
- **`src/components/`**:
    - **`InputForm.tsx`**: Handles user input for timing assumptions with validation.
    - **`ResultsPanel.tsx`**: Displays the computed metrics in a clean, visual format.
    - **`ModelSelector.tsx`**: Allows users to choose between different queueing models (currently M/M/1).
    - **`Sidebar.tsx` & `ThemeToggle.tsx`**: Provide navigation and dark/light mode support.
- **`src/app/globals.css`**: Uses **Tailwind CSS v4** and custom CSS variables (`--bg`, `--accent`, etc.) to create a "glassmorphic" and highly styled aesthetic.

---

## 🔄 Data Flow & Workflow
1. **User Input:** The user selects a model and enters the **Mean Interarrival Time** and **Mean Service Time**.
2. **API Call:** On clicking "Analyze Queue", the frontend sends a JSON `POST` request to the backend.
3. **Computation:**
    - Backend calculates $\lambda = 1 / \text{Interarrival Time}$.
    - Backend calculates $\mu = 1 / \text{Service Time}$.
    - If $\lambda < \mu$, it computes the metrics.
4. **Response:** The backend returns a JSON object containing $\rho$, $L$, $L_q$, $W$, $W_q$, and Idle Probability.
5. **Visualization:** The frontend receives the data and updates the `ResultsPanel` to show the performance indicators.

---

## 💻 Technology Stack
- **Backend:** ASP.NET Core, C#, Entity Framework (not yet used, but configured in solution), Swagger/OpenAPI.
- **Frontend:** Next.js 15+, React 19, TypeScript, Tailwind CSS, Lucide React (Icons), React Hot Toast (Notifications).
- **Tooling:** Docker (Dockerfile provided for backend), Visual Studio Solution (`.sln`).

---

## 🚦 How it Works (The M/M/1 Logic)
The system uses standard Little's Law and queueing theory formulas:
- **Utilization ($\rho$):** $\lambda / \mu$
- **Avg. Customers in Queue ($L_q$):** $\frac{\rho^2}{1 - \rho}$
- **Avg. Time in Queue ($W_q$):** $L_q / \lambda$
- **Avg. Time in System ($W$):** $W_q + (1 / \mu)$
- **Avg. Customers in System ($L$):** $\lambda \times W$
