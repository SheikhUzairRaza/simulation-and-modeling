# Use Case Diagram Specification

## 1. Document Purpose

This document provides the functional context required to create professional UML use case diagrams for the **Queueing Model and Bank Service Simulation System**.

It is intended for a diagram authoring assistant, designer, or architect who needs enough product context to produce diagrams that are:

- accurate
- readable
- professionally structured
- consistent with industry documentation standards

## 2. System Overview

The project is a web-based analytical and simulation system used to:

- evaluate queueing models
- compare queue performance across different model types
- simulate a bank branch operating environment

The system contains two major functional domains:

1. **Queue Model Analysis**
2. **Bank Branch Simulation**

## 3. Technology Context

### 3.1 Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### 3.2 Backend

- ASP.NET Core Web API
- C#
- .NET 8

## 4. Primary Actor

The primary actor in all use case diagrams is:

- **End User**

The End User is a normal application user who interacts with the browser-based frontend to run analyses and review outputs.

## 5. Functional Scope

### 5.1 Queue Analysis Models

#### Single-Server Models

- `M/M/1`
- `M/G/1`
- `G/G/1`

#### Multi-Server Models

- `M/M/s`
- `M/G/s`
- `G/G/s`

### 5.2 Bank Simulation Module

The system also includes a bank simulation view that models a realistic branch operating day using branch assumptions and traffic patterns.

## 6. Business Goal

The system enables users to:

- choose a queue model
- provide model-specific inputs
- run queue analysis
- review performance metrics
- compare model outcomes
- explore a bank branch operational scenario

## 7. Analytical Queue Domain

### 7.1 Common Functional Flow

Across all analytical queue models, the user generally performs the following actions:

1. Select a queue model
2. Enter required inputs
3. Run the analysis
4. View output metrics
5. Compare results

### 7.2 Common Output Metrics

The following metrics are displayed to the user after analysis:

- Utilization
- Idle Probability
- Arrival Rate (`lambda`)
- Service Rate (`mu`)
- Spare Capacity
- Mean Queue Length (`Lq`)
- Mean Queue Wait (`Wq`)
- Mean System Length (`L`)
- Mean System Wait (`W`)

## 8. Single-Server Analysis Scope

### 8.1 Models Included

- `M/M/1`
- `M/G/1`
- `G/G/1`

### 8.2 Single-Server Use Cases

- Select Single-Server Model
- Enter Core Inputs
- Enter Variability Inputs
- Run Analysis
- View Output Metrics
- Compare Results

### 8.3 Single-Server Inputs

#### Core Inputs

- Mean Interarrival Time
- Mean Service Time

#### Conditional Inputs

- Interarrival Time Standard Deviation
- Service Time Standard Deviation

These conditional inputs are required only for models that include general or variable arrival/service behavior.

### 8.4 Suggested UML Relationships

#### Actor Associations

- End User -> Select Single-Server Model
- End User -> Enter Core Inputs
- End User -> Run Analysis
- End User -> View Output Metrics
- End User -> Compare Results

#### Internal Relationships

- Select Single-Server Model -> Enter Core Inputs
- Enter Core Inputs -> Run Analysis
- Run Analysis -> View Output Metrics
- View Output Metrics -> Compare Results

#### Optional UML Semantics

- `Enter Variability Inputs` may `<<extend>>` `Select Single-Server Model`
  because only some single-server models require variability-related inputs

- `Enter Variability Inputs` may `<<include>>` `Run Analysis`
  because those values become necessary before execution when the selected model requires them

## 9. Multi-Server Analysis Scope

### 9.1 Models Included

- `M/M/s`
- `M/G/s`
- `G/G/s`

### 9.2 Multi-Server Use Cases

- Select Multi-Server Model
- Enter Core Inputs
- Enter Number of Servers
- Enter Variability Inputs
- Run Analysis
- View Output Metrics
- Compare Results

### 9.3 Multi-Server Inputs

#### Core Inputs

- Mean Interarrival Time
- Mean Service Time

#### Required Additional Input

- Number of Servers

#### Conditional Inputs

- Interarrival Time Standard Deviation
- Service Time Standard Deviation

### 9.4 Suggested UML Relationships

#### Actor Associations

- End User -> Select Multi-Server Model
- End User -> Enter Core Inputs
- End User -> Run Analysis
- End User -> View Output Metrics
- End User -> Compare Results

#### Internal Relationships

- Select Multi-Server Model -> Enter Core Inputs
- Enter Core Inputs -> Run Analysis
- Run Analysis -> View Output Metrics
- View Output Metrics -> Compare Results

#### Recommended UML Semantics

- `Enter Number of Servers` should `<<include>>` `Run Analysis`
  because server count is mandatory for all multi-server models

- `Enter Variability Inputs` may `<<extend>>` `Select Multi-Server Model`
  because only some multi-server models require those values

- `Enter Variability Inputs` may `<<include>>` `Run Analysis`
  when the chosen model requires variability input before execution

## 10. Bank Simulation Scope

This module may be modeled as a separate use case diagram.

### 10.1 Bank Simulation Use Cases

- Open Bank Simulation
- Select Branch Profile
- Review Branch Assumptions
- Run Branch Day Simulation
- View Daily Branch Summary
- View Hourly Pressure Table
- Compare Branch Conditions

### 10.2 Bank Simulation Inputs

- Branch profile
- Teller count assumptions
- Queue limit assumptions
- Service assumptions
- Arrival pattern assumptions

### 10.3 Bank Simulation Outputs

- Total arrivals
- Total served
- Total abandoned
- Average wait
- Peak queue
- Teller utilization
- Busiest service window
- Hourly operational snapshots

## 11. System Boundary Naming

The following system boundary names are acceptable:

- `Queue Analysis System`
- `Single-Server Analysis System`
- `Multi-Server Analysis System`
- `Bank Branch Simulation System`

## 12. Diagram Deliverables

The diagram author should produce:

1. **Single-Server Use Case Diagram**
2. **Multi-Server Use Case Diagram**
3. optionally **Bank Branch Simulation Use Case Diagram**

## 13. Diagram Style Requirements

The required style is:

- UML use case style
- one primary actor on the left
- system boundary rectangle
- use case ellipses inside the boundary
- plain association lines from actor to primary use cases
- dashed labeled relationships for `<<include>>` and `<<extend>>`
- minimal line crossing
- strong vertical or horizontal alignment
- balanced spacing
- presentation-quality readability

## 14. Diagram Authoring Guidance

When generating the diagrams:

- keep the actor associations limited to the major user-triggered actions
- avoid connecting the actor to every conditional input use case unless necessary
- use `<<include>>` and `<<extend>>` to reduce clutter
- prefer a layout that separates:
  - primary use cases
  - conditional input use cases
  - output/review use cases

## 15. Ready-to-Use Prompt

The following prompt can be given directly to a diagram-generation assistant:

```text
Create professional UML use case diagrams for a Queueing Model and Bank Service Simulation System.

I need separate diagrams for:
1. Single-server queue analysis
2. Multi-server queue analysis
3. Optionally a bank branch simulation module

Primary actor:
- End User

Single-server models:
- M/M/1
- M/G/1
- G/G/1

Single-server use cases:
- Select Single-Server Model
- Enter Core Inputs
- Enter Variability Inputs
- Run Analysis
- View Output Metrics
- Compare Results

Multi-server models:
- M/M/s
- M/G/s
- G/G/s

Multi-server use cases:
- Select Multi-Server Model
- Enter Core Inputs
- Enter Number of Servers
- Enter Variability Inputs
- Run Analysis
- View Output Metrics
- Compare Results

Optional bank simulation use cases:
- Open Bank Simulation
- Select Branch Profile
- Review Branch Assumptions
- Run Branch Day Simulation
- View Daily Branch Summary
- View Hourly Pressure Table
- Compare Branch Conditions

Use proper UML notation with:
- actor on the left
- system boundary
- use case ellipses
- plain actor associations
- dashed <<include>> and <<extend>> relationships where suitable

Keep the diagrams clean, minimal, balanced, and presentation-quality.
Avoid unnecessary crossing lines.
```

## 16. Final Quality Standard

The final diagrams should look like they belong in:

- a software design document
- a requirements specification
- an academic or professional system analysis report
- an engineering presentation deck
