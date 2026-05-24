/**
 * SEOPanelPage.tsx — Texly AI SEO Automation Panel
 * Full-screen panel (DevStudio जैसा pattern) 
 * Route: /seo-panel
 */

import React, { useState, useEffect } from "react";
import {
  Compass, LayoutDashboard, Wand2, Wrench, Settings, Layers,
  Sparkles, Menu, X
} from "lucide-react";

import { SEOPage, AutomationLog, KeywordResult } from "./types";
import DashboardTab from "./DashboardTab";
import KeywordTab from "./KeywordTab";
import ContentTab from "./ContentTab";
import SandboxTab from "./SandboxTab";
import ExporterTab