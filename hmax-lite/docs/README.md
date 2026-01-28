HMAX-Lite: Panama Metro Line 3 Digital Twin

🚝 Project Overview

HMAX-Lite is a real-time SCADA (Supervisory Control and Data Acquisition) simulation designed to model the telemetry and operations of the Panama Metro Line 3 Monorail.

This project serves as a "Digital Twin" proof-of-concept, visualizing the movement of 6-car monorail trainsets along the 25km route from Albrook to Ciudad del Futuro. It focuses on critical engineering challenges specific to this project, including the Canal Tunnel Geofencing and B-CHOP Energy Recovery monitoring.

🎯 Objective

To demonstrate scalable architecture for Industrial IoT (IIoT) and Critical Infrastructure Systems, replicating the logic used in modern Operations Control Centers (OCC).

🏗️ Architecture

The system follows a microservices architecture designed for edge deployment:

Telemetry Engine (Backend): A Python (FastAPI) service that acts as the "Train Controller." It uses physics-based logic to interpolate GPS coordinates, calculate speed curves, and simulate sensor data (regenerative braking temperatures).

Operations Dashboard (Frontend): A React + TypeScript interface visualizing the geospatial data on a dark-mode Leaflet map.

State Management: Real-time state synchronization using TanStack Query to minimize latency between the "Edge" (Train) and the "Center" (Dashboard).

Deployment: Fully containerized using Docker, ready for deployment on Kubernetes clusters or Edge Gateways.

⚡ Key Features

1. 🚇 Canal Tunnel "Dead Zone" Logic

Engineering Context: The 5.3km tunnel under the Panama Canal requires specific communication relays and safety protocols.

Simulation: The system detects when a train enters the geofence between Balboa and Panama Pacifico.

Visual Feedback: The dashboard switches the train's status to TUNNEL_MODE, changing telemetry frequency and UI indicators to purple.

2. 🔋 B-CHOP Energy Recovery Monitor

Engineering Context: Hitachi monorails utilize the B-CHOP (Brake CHOPper) system to capture energy during braking and store it for acceleration.

Simulation: The backend physics engine triggers "Regen Mode" when trains decelerate approaching a station.

Data Visualization: The dashboard renders real-time graphs showing energy_recovered_kwh spikes, simulating the efficiency gains of the actual rolling stock.

3. ⏱️ CBTC Moving Block Simulation

Engineering Context: Communications-Based Train Control (CBTC) allows trains to run closer together safely.

Simulation: The system tracks the "Next Station ETA" and manages the virtual headway between the 5 active trains on the line.

💻 Implementation Preview

The interface is built to mimic Palantir Foundry or Hitachi HMAX systems, prioritizing information density, high contrast, and situational awareness.

Dashboard Component (TrainDetailPanel.tsx)

Note: This sample demonstrates the industrial styling and data-binding logic.

import { Zap, Activity, Wifi, AlertTriangle } from 'lucide-react';

export const TrainDetailPanel = ({ train, telemetry }) => {
  const isTunnelMode = train.status === 'TUNNEL_MODE';

  return (
    // "Glassmorphism" Dark Container with Industrial Border
    <div className="bg-slate-900/90 border border-slate-700 backdrop-blur-md w-80 h-full flex flex-col font-mono text-xs">
      
      {/* Header: Status Indicator */}
      <div className={`p-3 border-b border-slate-700 flex justify-between items-center ${isTunnelMode ? 'bg-purple-900/20' : ''}`}>
        <div>
          <h2 className="text-slate-100 font-bold text-sm tracking-wider">{train.id}</h2>
          <span className="text-slate-400">Heading: {train.heading}° West</span>
        </div>
        <div className={`px-2 py-1 rounded border ${isTunnelMode ? 'border-purple-500 text-purple-400' : 'border-emerald-500 text-emerald-400'}`}>
          {train.status}
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-px bg-slate-800">
        <MetricBox 
          label="SPEED (KM/H)" 
          value={telemetry.speed.toFixed(1)} 
          unit="km/h"
          icon={<Activity size={14} />} 
        />
        <MetricBox 
          label="VOLTAGE (kV)" 
          value={telemetry.voltage} 
          unit="kV DC"
          color="text-amber-400"
          icon={<Zap size={14} />} 
        />
      </div>

      {/* B-CHOP Energy Monitor */}
      <div className="p-4 flex-1">
        <div className="flex justify-between items-end mb-2">
          <span className="text-slate-500 font-semibold">B-CHOP EFFICIENCY</span>
          <span className="text-emerald-400 font-bold">{telemetry.regen_efficiency}%</span>
        </div>
        {/* Mock Visualization Line */}
        <div className="h-16 w-full bg-slate-800 border border-slate-700 relative overflow-hidden">
          <div 
            className="absolute bottom-0 left-0 h-full bg-emerald-500/20 w-full"
            style={{ transform: `scaleY(${telemetry.regen_efficiency / 100})`, transformOrigin: 'bottom' }} 
          />
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-20">
             {/* Grid overlay for "SCADA" look */}
          </div>
        </div>
      </div>

      {/* Alert Footer */}
      {isTunnelMode && (
        <div className="p-3 bg-purple-900/30 border-t border-purple-800 flex items-center gap-3">
          <Wifi className="text-purple-400 animate-pulse" size={16} />
          <span className="text-purple-200">TUNNEL RELAY ACTIVE</span>
        </div>
      )}
    </div>
  );
};

const MetricBox = ({ label, value, unit, icon, color = "text-white" }) => (
  <div className="bg-slate-900 p-3 flex flex-col justify-center border-slate-800">
    <div className="flex justify-between mb-1 opacity-50">
      {icon}
      <span>{unit}</span>
    </div>
    <div className={`text-2xl font-light tracking-tighter ${color}`}>
      {value}
    </div>
    <div className="text-[10px] text-slate-500 mt-1">{label}</div>
  </div>
);


Physics Engine (simulator.py)

Note: This snippet demonstrates the simulated physics cycle for Energy Recovery and Tunnel Safety.

def update_telemetry(self, dt: float):
    """
    Simulates Hitachi Monorail physics cycle (100ms tick).
    Calculates B-CHOP efficiency based on regenerative braking curves.
    """
    # 1. Physics Calculation (Kinematics)
    if self.approaching_station:
        decel_force = self.calculate_braking_curve(self.dist_to_station)
        self.speed -= decel_force * dt
        
        # 2. B-CHOP Logic (Energy Capture)
        # If braking force > threshold, engage capacitors
        if decel_force > 0.8: 
            self.b_chop_status = "ACTIVE"
            # E = 1/2 mv^2 (efficiency loss included)
            recovered_joules = (0.5 * TRAIN_MASS * (self.speed**2)) * 0.40
            self.energy_recovered_kwh += joules_to_kwh(recovered_joules)
            self.regen_temp += 1.5 # Heat spike simulation
            
    # 3. Geofence Trigger (Tunnel Logic)
    if TUNNEL_POLYGON.contains(self.gps_coords):
        self.status = "TUNNEL_MODE" # Switch to low-latency relay
        self.comms_protocol = "UDP_TUNNEL_RELAY"


🛠️ Tech Stack

Component

Technology

Role

Backend

Python 3.11, FastAPI

Telemetry generation, Physics engine

Frontend

React, Vite, TypeScript

Human-Machine Interface (HMI)

Maps

Leaflet, React-Leaflet

Geospatial visualization (OpenStreetMap)

Styling

Tailwind CSS

Industrial "Dark Mode" UI

Containerization

Docker, Docker Compose

Infrastructure orchestration

🚀 How to Run Locally

Prerequisites

Docker & Docker Compose

Node.js 18+ (for local dev)

Quick Start

Clone the repository:

git clone [https://github.com/yourusername/panama-line3-sim.git](https://github.com/yourusername/panama-line3-sim.git)
cd panama-line3-sim



Start the services:

docker-compose up --build



Access the Dashboard:

Frontend (OCC): http://localhost:3000

API Docs: http://localhost:8000/docs

📍 Route Data

The simulation uses interpolated GPS coordinates for the 14 planned stations, including:

Albrook (Terminal)xe

Balboa (Tunnel Entry)

Panama Pacifico (Tunnel Exit)

Arraiján

Ciudad del Futuro (Terminal)

👨‍💻 Author

Angel Pinzon
Systems Engineer | Computer Engineer
LinkedIn | Portfolio

Note: This is a personal project for educational and demonstrxation purposes. It is not affiliated with Metro de Panamá S.A. or Hitachi Rail.