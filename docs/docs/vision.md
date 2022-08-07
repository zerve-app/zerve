---
title: Vision
sidebar_position: 1
---

# What is Zerve, really?

The Zerve product can re-introduce the "head" to the modern Content Management System, but the deep Open Source roots may enable dramatic new app-creation workflows in the future.

Keep in mind this is the _long-term_ vision for Zerve. The intention is to focus on each phase until it is "solved", and continue supporting previous phases while we move forward. Don't expect rapid progress- this progression might take decades.

### Phase I - Zerve Content System

The Content System aims to solve the most immediate problems in your workflow, and allow an incremental migration away from proprietary content systems.

To stay practical, we are starting with CMS use-cases, because the requirements are highly constrained. In a CMS, there are fewer writes and authors, when compared to a "user data" system.

Eventually Zerve will act like a backend-in-a-box, supporting user data, an account system, scalability, and near-real-time data changes.

### Phase II - Zerve Framework

For now, the Zerve monorepo is fragile and highly-coupled with itself, but it is already broken into distinct building blocks. Eventually these components will be usable independently:

- [Zed](./internal/zed): The logical and data layer which manages schemas and data across the back-end and the clients
- [Zen](./internal/zen): A modular UI layer that works across mobile and web, and eases platform distinctions
- [Zoo](./internal/zoo): The 'glue' that keeps the project together, with simple deployment tools for running on your server

We aim to document and de-couple these components. Of course this helps internal contributors, but the goal is to support any aspiring software engineer who wants to build and deploy a full-stack application using this tech stack.

Front-end engineers should have an easy-to-use backend that 'just works' for most use-cases. And back-end engineers should be able to build a custom server using the Zed framework, and get a 'free' front-end app for every platform that queries the API to present an appropriate UI.

### Phase III - Zerve Auto-Apps

Once engineers are satisfied with a robust full-stack framework for building apps, we can empower non-technical people to build apps on their own.

With a few taps it should be possible to spin up a private Zerve server, which would have the ability to generate its own cross-platform client apps.

Then our system might resemble a sustainable "NoCode" solution. Because we are fully Open Source under a liberal license, and because software engineers have the freedom to own and control the parts of the stack they need to, non-technical creators will retain actual ownership over their app and community they create within Zerve.
