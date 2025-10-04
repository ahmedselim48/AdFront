import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { registerLocaleData } from '@angular/common';
import localeArSa from '@angular/common/locales/ar-SA';
import { LucideAngularModule, MessageCircle, User, Plus, Bell, BellRing, BellOff, Settings, BarChart3, Home, Search, Filter, Heart, Eye, MessageSquare, Star, TrendingUp, Users, Shield, CreditCard, FileText, Zap, Target, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Info, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Menu, X, Edit, Trash2, Save, Upload, Download, Share, Copy, ExternalLink, Lock, Unlock, EyeOff, Eye as EyeIcon, MoreHorizontal, MoreVertical, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Maximize, Minimize, RotateCcw, RefreshCw, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Mail, Send, Paperclip, Image, File, Folder, FolderOpen, Tag, Tags, Hash, AtSign, Link, Globe, MapPin, Navigation, Compass, Map, Layers, Grid, List, Layout, Sidebar, PanelLeft, PanelRight, BarChart, PieChart, LineChart, Activity, TrendingDown, DollarSign, Percent, Calculator, Calendar as CalendarIcon, Clock as ClockIcon, Timer, Watch, Smartphone, Laptop, Monitor, Tablet, Headphones, Camera, Printer, HardDrive, Database, Server, Cloud, Wifi, WifiOff, Bluetooth, Battery, BatteryCharging, Power, Zap as ZapIcon, Sun, Moon, CloudRain, CloudSnow, CloudLightning, Wind, Thermometer, Droplets, Umbrella, Sun as SunIcon, Moon as MoonIcon, Star as StarIcon, Heart as HeartIcon, ThumbsUp, ThumbsDown, Smile, Frown, Meh, Laugh, Angry, Smile as SmileIcon, Frown as FrownIcon, Meh as MehIcon, Laugh as LaughIcon, Angry as AngryIcon, LogIn, LogOut, Trophy, MousePointer, ShoppingBag, Megaphone, Check, CheckCheck, Edit3, Trash, Car, Shirt, Wrench, Book, Gamepad2, Briefcase } from 'lucide-angular';
import { importProvidersFrom } from '@angular/core';
import { appConfig } from './app/app.config';
import { CoreModule } from './app/core/core.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './app/core/interceptors/auth.interceptor';
import { LoadingInterceptor } from './app/core/interceptors/loading.interceptor';
import { LoggingInterceptor } from './app/core/interceptors/logging.interceptor';

registerLocaleData(localeArSa);

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    importProvidersFrom(
      CoreModule,
      LucideAngularModule.pick({ 
        MessageCircle, User, Plus, Bell, BellRing, BellOff, Settings, BarChart3, Home, Search, Filter, Heart, Eye, MessageSquare, Star, TrendingUp, Users, Shield, CreditCard, FileText, Zap, Target, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Info, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Menu, X, Edit, Trash2, Save, Upload, Download, Share, Copy, ExternalLink, Lock, Unlock, EyeOff, EyeIcon, MoreHorizontal, MoreVertical, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Maximize, Minimize, RotateCcw, RefreshCw, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Mail, Send, Paperclip, Image, File, Folder, FolderOpen, Tag, Tags, Hash, AtSign, Link, Globe, MapPin, Navigation, Compass, Map, Layers, Grid, List, Layout, Sidebar, PanelLeft, PanelRight, BarChart, PieChart, LineChart, Activity, TrendingDown, DollarSign, Percent, Calculator, CalendarIcon, ClockIcon, Timer, Watch, Smartphone, Laptop, Monitor, Tablet, Headphones, Camera, Printer, HardDrive, Database, Server, Cloud, Wifi, WifiOff, Bluetooth, Battery, BatteryCharging, Power, ZapIcon, Sun, Moon, CloudRain, CloudSnow, CloudLightning, Wind, Thermometer, Droplets, Umbrella, SunIcon, MoonIcon, StarIcon, HeartIcon, ThumbsUp, ThumbsDown, Smile, Frown, Meh, Laugh, Angry, SmileIcon, FrownIcon, MehIcon, LaughIcon, AngryIcon, LogIn, LogOut, Trophy, MousePointer, ShoppingBag, Megaphone, Check, CheckCheck, Edit3, Trash, Car, Shirt, Wrench, Book, Gamepad2, Briefcase
      })
    ),
    // HTTP Interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoggingInterceptor,
      multi: true
    }
  ]
}).catch(err => console.error(err));
