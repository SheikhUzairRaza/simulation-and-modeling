# User Project Guide

## Project Overview

This project is a **Queueing Model and Bank Service Simulation System**.

It helps a user:

- choose a queue model from the frontend
- enter service and arrival values
- calculate queue performance results
- compare different queue models
- view a simple bank branch simulation with realistic branch activity

The project is split into two main parts:

- `frontend`
- `backend`

## What The Frontend Does

The frontend is the part the user sees and interacts with in the browser.

A user can:

- open the dashboard
- select a queue model such as `M/M/1`, `M/G/1`, `G/G/1`, `M/M/s`, `M/G/s`, or `G/G/s`
- enter the required values
- click `Analyze Queue`
- see result metrics on screen
- open the `Bank Simulation` section from the sidebar
- view a branch-day simulation for a bank environment

### Main Frontend Features

- model selection interface
- input forms for queue values
- result panel for output metrics
- sidebar navigation
- theme toggle
- bank branch simulation view

### Frontend Pages And Components

Important frontend files:

- [page.tsx](C:/Users/PMLS/Desktop/modeling-and-sim/queueing_model_and_simulator/frontend/src/app/page.tsx)
  Main page that controls model selection, form submission, and result display

- [ModelSelector.tsx](C:/Users/PMLS/Desktop/modeling-and-sim/queueing_model_and_simulator/frontend/src/components/ModelSelector.tsx)
  Lets the user select which queue model to test

- [InputForm.tsx](C:/Users/PMLS/Desktop/modeling-and-sim/queueing_model_and_simulator/frontend/src/components/InputForm.tsx)
  Shows the input fields needed for the selected model

- [ResultsPanel.tsx](C:/Users/PMLS/Desktop/modeling-and-sim/queueing_model_and_simulator/frontend/src/components/ResultsPanel.tsx)
  Displays queue output metrics

- [Sidebar.tsx](C:/Users/PMLS/Desktop/modeling-and-sim/queueing_model_and_simulator/frontend/src/components/Sidebar.tsx)
  Sidebar navigation for queue models and bank simulation

- [BankSimulationPanel.tsx](C:/Users/PMLS/Desktop/modeling-and-sim/queueing_model_and_simulator/frontend/src/components/BankSimulationPanel.tsx)
  Simulates a realistic bank branch operating day

## What The Backend Does

The backend is the calculation engine.

It receives the user input from the frontend, performs queueing calculations, and sends the results back.

### Main Backend Features

- provides API endpoints for queue model calculations
- validates user input
- calculates queue metrics
- supports single-server and multi-server models
- supports Swagger API testing

### Queue Models Implemented

The backend supports these models:

- `M/M/1`
- `M/G/1`
- `G/G/1`
- `M/M/s`
- `M/G/s`
- `G/G/s`

### Backend Files

Important backend files:

- [Program.cs](C:/Users/PMLS/Desktop/modeling-and-sim/queueing_model_and_simulator/backend/Program.cs)
  Starts the API and configures services, controllers, CORS, and Swagger

- [SimulationController.cs](C:/Users/PMLS/Desktop/modeling-and-sim/queueing_model_and_simulator/backend/Controllers/SimulationController.cs)
  Contains the API routes for all queue models

- [Services](C:/Users/PMLS/Desktop/modeling-and-sim/queueing_model_and_simulator/backend/Services)
  Contains the queue calculation logic

- [Models](C:/Users/PMLS/Desktop/modeling-and-sim/queueing_model_and_simulator/backend/Models)
  Contains the request models used by the API

## What Output The User Gets

After entering input and clicking `Analyze Queue`, the user sees these output metrics:

- `Utilization`
- `Idle Probability`
- `Arrival (lambda)`
- `Service (mu)`
- `Spare Capacity`
- `Mean Queue Length (Lq)`
- `Mean Queue Wait (Wq)`
- `Mean System Length (L)`
- `Mean System Wait (W)`

These help the user understand:

- how busy the system is
- how long customers wait
- how many customers are in line
- whether the system has enough service capacity

## Bank Simulation Feature

The project also contains a separate **Bank Simulation** view.

This is different from the mathematical queue models.

It shows a more realistic branch-style simulation with:

- branch profiles
- teller counts
- queue limits
- service variability
- customer abandonment
- hourly traffic patterns
- daily branch summary metrics

This gives the user a more visual and practical understanding of how a bank branch might perform during a working day.

## Technology Stack

### Frontend Stack

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React**
- **React Hot Toast**

### Backend Stack

- **ASP.NET Core Web API**
- **C#**
- **.NET 8**
- **Swagger / OpenAPI**

## How Frontend And Backend Work Together

1. The user opens the frontend page.
2. The user selects a queue model.
3. The user enters input values.
4. The frontend sends those values to the backend API.
5. The backend calculates the results.
6. The backend returns the result values.
7. The frontend displays the metrics on the screen.

## What Makes This Project Useful

This project is useful for:

- students learning queueing theory
- researchers comparing queue models
- anyone testing how service systems behave
- anyone simulating customer service settings such as a bank

It combines:

- a usable frontend interface
- a structured backend API
- multiple queueing models
- a simple realistic branch simulation

## Summary

In simple words:

- the **frontend** is where the user interacts with the system
- the **backend** performs the real calculations
- the project supports several queueing models
- the project also includes a bank branch simulation view
- the stack is modern and split cleanly between UI and API
