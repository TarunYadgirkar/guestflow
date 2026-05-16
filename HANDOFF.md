# GuestFlow Project Handoff

## Project Overview

This document provides a handoff for the GuestFlow project. The project is now in a clean state, with a working linter and type checker.

## Current State

The project is a Node.js project using TypeScript and React. The following has been done:

*   The `package.json` file has been restored.
*   Dependencies have been installed using `npm install`.
*   TypeScript has been configured with `tsconfig.json`.
*   ESLint has been set up for linting with a modern `eslint.config.js` file.
*   A `lint` script has been added to `package.json`.
*   Type checking and linting have been confirmed to pass.

## Data Contract

The core of the project is the data contract, defined in `shared/types.ts`. This file contains all the TypeScript types that define the data structures for the GuestFlow application. The data contract is marked as "FROZEN", indicating that it is considered stable.

The data contract defines the following main entities:

*   **Guest:** Represents a guest with their preferences, stay history, and upcoming reservation.
*   **StaffMember:** Represents a staff member with their roles, languages, and specialties.
*   **FlightStatus:** Represents the status of a flight.
*   **OrchestrationResult:** The top-level object that brings everything together, including a `RoomSpec`, `GuestItinerary`, `HostAssignment`, and `HostBrief`.

## Next Steps

The next steps for this project would be to implement the application logic and UI based on the defined data contract. This would involve:

*   Creating React components in the `web/components` directory.
*   Implementing business logic in the `agent` or `src` directories.
*   Connecting to a backend to fetch and store data.

## How to Run

Currently, the project is not runnable. However, you can run the following commands:

*   `npm run typecheck`: To check for TypeScript errors.
*   `npm run lint`: To lint the code.
