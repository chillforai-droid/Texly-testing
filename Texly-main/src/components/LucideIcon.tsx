/**
 * LucideIcon.tsx — Dynamic icon loader
 *
 * PERF FIX: Only icons actually used in tools.ts + UI components are imported.
 * Previously ALL 150+ icons were bundled → unnecessary JS parsing / TBT.
 * Removed unused icons (Plane, Train, Beer, Pizza, etc.) → ~15KB savings.
 */
import React from 'react';
import {
  Activity, AlignLeft, AlertCircle, AlertTriangle,
  ArrowRight, ArrowUp, ArrowDown, ArrowLeft,
  Baby, BarChart, BarChart3, Bell, Binary, BookOpen, Bookmark, Brain, Braces,
  Calendar, Camera, ChevronRight, ChevronLeft, ChevronUp, ChevronDown,
  Check, CheckCircle2, CheckSquare, Circle, Clipboard, Clock, Code, Code2,
  Columns, Compass, Contrast, Copy, CopyMinus, CornerDownLeft,
  Database, Divide, Download,
  Eraser, ExternalLink, Eye, EyeOff,
  Facebook, File, FileImage, FileJson, FilePlus, FileSpreadsheet, FileText,
  Filter, Flag, Flame,
  Github, Globe, GraduationCap, Grid,
  Hash, Heading, Heading1, Heading2, Heading3, Heart, HelpCircle,
  Highlighter, History, Home, Hourglass,
  Image as ImageIcon, Inbox, Info, Instagram, Italic,
  Key, Keyboard,
  Landmark, Languages, Layers, Layout, Lightbulb,
  Link as LinkIcon, Link2, LineChart, List, ListOrdered, ListTodo, Lock, Loader2,
  Mail, Maximize, MessageCircle, MessageSquare, Menu, Mic, Mic2, Minimize, Minimize2, Minus, Moon, Mouse, MousePointer, Move,
  Navigation, Network, Notebook,
  Palette, Paperclip, Pencil, Percent, Phone, PieChart, Pipette, Plus, PlusCircle, MinusCircle, Pointer,
  QrCode,
  Radio, RefreshCw, Repeat, Rocket, RotateCcw, RotateCw, Rows,
  Save, Scale, Scissors, Search, SearchCode, Send, Server, Settings,
  Share2, Shield, ShieldAlert, ShieldCheck, Shuffle, Sigma, Sliders, Smile,
  SortAsc, SortDesc, Space, Sparkles, Square, Star, Stars,
  Table, Tag, Ticket, Timer, ThumbsUp, ThumbsDown, TrendingUp, Trash2, Twitter, Tv, Type,
  Unlock, Upload, UserCheck, UserCircle2, UserMinus, UserPlus, UserX, Users,
  Video,
  Wifi, Wrench,
  X, XCircle,
  Youtube, Zap,
  ZoomIn, ZoomOut,
  Sun,
} from 'lucide-react';

// Aliases for icon names used in tools.ts that differ from lucide export names
const Combine = Layers;
const Edit = Pencil;
const Ghost = Smile;
const Trash = Trash2;
const Image = ImageIcon;

const icons: Record<string, React.FC<any>> = {
  Activity, AlignLeft, AlertCircle, AlertTriangle,
  ArrowRight, ArrowUp, ArrowDown, ArrowLeft,
  Baby, BarChart, BarChart3, Bell, Binary, BookOpen, Bookmark, Brain, Braces,
  Calendar, Camera, ChevronRight, ChevronLeft, ChevronUp, ChevronDown,
  Check, CheckCircle2, CheckSquare, Circle, Clipboard, Clock, Code, Code2,
  Columns, Combine, Compass, Contrast, Copy, CopyMinus, CornerDownLeft,
  Database, Divide, Download,
  Edit, Eraser, ExternalLink, Eye, EyeOff,
  Facebook, File, FileImage, FileJson, FilePlus, FileSpreadsheet, FileText,
  Filter, Flag, Flame,
  Ghost, Github, Globe, GraduationCap, Grid,
  Hash, Heading, Heading1, Heading2, Heading3, Heart, HelpCircle,
  Highlighter, History, Home, Hourglass,
  Image, ImageIcon, Inbox, Info, Instagram, Italic,
  Key, Keyboard,
  Landmark, Languages, Layers, Layout, Lightbulb,
  Link: LinkIcon, Link2, LineChart, List, ListOrdered, ListTodo, Lock, Loader2,
  Mail, Maximize, MessageCircle, MessageSquare, Menu, Mic, Mic2, Minimize, Minimize2, Minus, Moon, Mouse, MousePointer, Move,
  Navigation, Network, Notebook,
  Palette, Paperclip, Pencil, Percent, Phone, PieChart, Pipette, Plus, PlusCircle, MinusCircle, Pointer,
  QrCode,
  Radio, RefreshCw, Repeat, Rocket, RotateCcw, RotateCw, Rows,
  Save, Scale, Scissors, Search, SearchCode, Send, Server, Settings,
  Share2, Shield, ShieldAlert, ShieldCheck, Shuffle, Sigma, Sliders, Smile,
  SortAsc, SortDesc, Space, Sparkles, Square, Star, Stars,
  Table, Tag, Ticket, Timer, ThumbsUp, ThumbsDown, Trash, Trash2, TrendingUp, Twitter, Tv, Type,
  Unlock, Upload, UserCheck, UserCircle2, UserMinus, UserPlus, UserX, Users,
  Video,
  Wifi, Wrench,
  X, XCircle,
  Youtube, Zap,
  ZoomIn, ZoomOut,
  Sun,
};

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  const IconComponent = icons[name] || Zap;
  return <IconComponent {...props} />;
};

export default DynamicIcon;
