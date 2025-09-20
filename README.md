# **NeuroSole**
## **reimagining comfort for every kind of foot using Insole**

NeuroSole is an AI-powered platform for designing and generating fully customized 3D insoles. Our mission is to bring comfort and accessibility to everyone — whether dealing with flat feet, fractures, swelling, pregnancy-related changes, or other unique conditions. 
Traditional orthopedic insoles take 1–4 days to design, are expensive, and require specialists. NeuroSole solves this by combining AI, 3D rendering, and 3D printing to deliver a personalized insole in hours. With only a foot scan and access to a basic 3D printer, anyone can generate their own insoles affordably and efficiently.

## 🚀 Workflow
Foot Scan → Upload a 3D scan of the user’s foot.

Rendering → Convert the scan into a clean STL model.

AI Generation → NeuroSole’s AI model designs a custom-fit insole.

Slicing → Export the insole design to Fusion 360, OrcaSlicer, TinkerCAD or another slicer.

3D Printing → Print the insole with standard filament on any FDM printer.

## 🛠️ Tech Stack
Frontend → React, Three.js (interactive STL rendering)

AI Model → Python (PyTorch / TensorFlow for generative design)

3D Tools inspo → Fusion 360, Cura, Blender

3D Printing → Filament-based FDM printers (Creality Ender-3 V3 SE)

## 📂 Usage Guide

A. Clone the repository:

git clone : https://github.com/garrgi11/neurosole.git

cd neurosole

B. Run the frontend (render STL + landing page).

C. Test rendering with:

examples/test_insole.stl

D. Generate a custom insole with AI:

```cd ai-model

python generate_insole.py --input foot_scan.stl --output insole.stl``

E. Slice and print using Fusion360 or OrcaSlicer or TinkerCAD.

## 🌍 Why NeuroSole

Fast → AI reduces design time from days to hours.

Affordable → No specialist fees, just a printer + filament.

Accessible → Anyone can generate and print their own insoles.

Inclusive → Designed for flat feet, swelling, fractures, pregnancy, and more.

NeuroSole is the future of personalized foot care — all feet, all people, all steps.

## 📌 Future Roadmap

Expand AI support for multiple medical conditions.

Build mobile foot scanning integration.

Improve user-friendly web interface.

Partner with clinics & orthopedists for validation.

Enable direct-to-consumer e-commerce for non-printer owners.

