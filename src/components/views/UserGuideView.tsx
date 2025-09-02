import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  FileText, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Shield, 
  Workflow,
  BookOpen,
  Download,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import { ProfessionalLogo } from '@/components/ui/professional-logo';

interface UserCredential {
  role: string;
  email: string;
  password: string;
  accessLevel: string;
  description: string;
}

const UserGuideView = () => {
  const [showPasswords, setShowPasswords] = useState(false);
  const [copiedCredential, setCopiedCredential] = useState<string | null>(null);

  const userCredentials: UserCredential[] = [
    {
      role: 'Admin',
      email: 'n.solange@africaworldcargo.com',
      password: 'Action@AWC',
      accessLevel: 'Full System Access',
      description: 'Complete system administration, user management, and oversight capabilities'
    },
    {
      role: 'Sales Director',
      email: 'i.arnold@africaworldcargo.com',
      password: 'Director@AWC',
      accessLevel: 'Sales Management',
      description: 'Sales team oversight, quotation approvals, and performance management'
    },
    {
      role: 'Sales Agent',
      email: 'a.benon@africaworldcargo.com',
      password: 'Agent@AWC',
      accessLevel: 'Quotation Creation',
      description: 'Create and manage quotations, view approved quotations and related invoices'
    },
    {
      role: 'Sales Agent',
      email: 'n.mariemerci@africaworldcargo.com',
      password: 'Agent2@AWC',
      accessLevel: 'Quotation Creation',
      description: 'Create and manage quotations, view approved quotations and related invoices'
    },
    {
      role: 'Finance Officer',
      email: 'u.epiphanie@africaworldcargo.com',
      password: 'Finance@AWC',
      accessLevel: 'Financial Management',
      description: 'Complete invoice management, financial reporting, and payment tracking'
    },
    {
      role: 'Partner',
      email: 'k.peter@africaworldcargo.com',
      password: 'Partner@AWC',
      accessLevel: 'Read-Only Access',
      description: 'View quotations, invoices, documents, and access limited financial reports'
    }
  ];

  const systemFeatures = [
    {
      icon: Users,
      title: 'User Management',
      description: 'Role-based access control with 6 distinct user types',
      roles: ['Admin']
    },
    {
      icon: FileText,
      title: 'Quotation Management',
      description: 'Complete quotation lifecycle from creation to approval',
      roles: ['Admin', 'Sales Director', 'Sales Agent']
    },
    {
      icon: DollarSign,
      title: 'Invoice Generation',
      description: 'Automated invoice creation with duplicate prevention',
      roles: ['Admin', 'Sales Director', 'Finance Officer']
    },
    {
      icon: BarChart3,
      title: 'Financial Reports',
      description: 'Comprehensive analytics and performance tracking',
      roles: ['Admin', 'Finance Officer', 'Partner']
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'Enterprise-grade security with audit logging',
      roles: ['Admin']
    },
    {
      icon: Workflow,
      title: 'Automated Workflows',
      description: 'Streamlined processes from quotation to payment',
      roles: ['All Roles']
    }
  ];

  const handleCopyCredential = async (email: string, password: string) => {
    const credentialText = `Email: ${email}\nPassword: ${password}`;
    try {
      await navigator.clipboard.writeText(credentialText);
      setCopiedCredential(email);
      setTimeout(() => setCopiedCredential(null), 2000);
    } catch (err) {
      console.error('Failed to copy credentials:', err);
    }
  };

  const handleDownloadGuide = () => {
    const element = document.createElement('a');
    element.setAttribute('href', '/AWC_Logistics_System_User_Guide.md');
    element.setAttribute('download', 'AWC_Logistics_System_User_Guide.md');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-4">
          <ProfessionalLogo size="xl" variant="default" animated showGlow />
          <div>
            <h1 className="text-4xl font-bold text-foreground">AWC Logistics Professional Suite</h1>
            <p className="text-xl text-muted-foreground mt-2">System User Guide & Presentation</p>
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <Button onClick={handleDownloadGuide} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Download Complete Guide
          </Button>
        </div>
      </div>

      <Separator />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="credentials">User Credentials</TabsTrigger>
          <TabsTrigger value="features">Features & Roles</TabsTrigger>
          <TabsTrigger value="workflows">System Workflows</TabsTrigger>
          <TabsTrigger value="security">Security & Best Practices</TabsTrigger>
        </TabsList>

        {/* System Overview */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                System Overview
              </CardTitle>
              <CardDescription>
                Comprehensive logistics management system for Africa World Cargo operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">Key Benefits</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      Role-based access control with 6 user types
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      Automated quotation-to-invoice workflow
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      Real-time notifications and monitoring
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      Comprehensive financial reporting
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      Multi-currency support (USD primary)
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">Core Modules</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      User & Role Management
                    </li>
                    <li className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      Quotation Management
                    </li>
                    <li className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      Invoice Generation
                    </li>
                    <li className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      Financial Analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      Document Management
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Credentials */}
        <TabsContent value="credentials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  System User Credentials
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="gap-2"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPasswords ? 'Hide' : 'Show'} Passwords
                </Button>
              </CardTitle>
              <CardDescription>
                Demo and testing credentials for all system roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {userCredentials.map((credential, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{credential.role}</CardTitle>
                        <Badge variant="secondary">{credential.accessLevel}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {credential.description}
                      </p>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Email:</span>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {credential.email}
                          </code>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Password:</span>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {showPasswords ? credential.password : '••••••••••'}
                          </code>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyCredential(credential.email, credential.password)}
                          className="w-full gap-2 mt-2"
                        >
                          {copiedCredential === credential.email ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          {copiedCredential === credential.email ? 'Copied!' : 'Copy Credentials'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features & Roles */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemFeatures.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <feature.icon className="w-5 h-5 text-primary" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {feature.roles.map((role, roleIndex) => (
                      <Badge key={roleIndex} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* System Workflows */}
        <TabsContent value="workflows" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="w-5 h-5" />
                  Quotation to Invoice Workflow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { step: 1, role: 'Sales Agent', action: 'Creates quotation with client details' },
                    { step: 2, role: 'Admin/Sales Director', action: 'Reviews and approves/rejects' },
                    { step: 3, role: 'System', action: 'Approved quotations become available' },
                    { step: 4, role: 'Sales Director/Agent', action: 'Generates invoice (one-time only)' },
                    { step: 5, role: 'Finance Officer', action: 'Manages payments and tracking' }
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        {item.step}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.role}</p>
                        <p className="text-sm text-muted-foreground">{item.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management Workflow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { step: 1, role: 'Admin', action: 'Creates user accounts with roles' },
                    { step: 2, role: 'System', action: 'Sets up profiles and permissions' },
                    { step: 3, role: 'Users', action: 'Receive credentials and role-based access' },
                    { step: 4, role: 'Admin', action: 'Monitors activity and modifies permissions' },
                    { step: 5, role: 'System', action: 'Maintains complete audit trail' }
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        {item.step}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.role}</p>
                        <p className="text-sm text-muted-foreground">{item.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security & Best Practices */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Authentication</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    <li>• Supabase enterprise-grade authentication</li>
                    <li>• Role-based database security</li>
                    <li>• Secure session management</li>
                    <li>• Encrypted credential storage</li>
                  </ul>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Data Protection</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    <li>• Row Level Security (RLS)</li>
                    <li>• Authenticated API endpoints</li>
                    <li>• Comprehensive input validation</li>
                    <li>• Complete audit logging</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">For Sales Team</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    <li>• Complete all required quotation fields</li>
                    <li>• Use clear cargo descriptions</li>
                    <li>• Set realistic follow-up dates</li>
                    <li>• Review profit margins before submission</li>
                  </ul>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">For Admin Users</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    <li>• Monitor user activity regularly</li>
                    <li>• Review pending quotations promptly</li>
                    <li>• Maintain accurate role assignments</li>
                    <li>• Track system performance metrics</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <Separator />
      <div className="text-center text-sm text-muted-foreground">
        <p>AWC Logistics Professional Suite - Streamlining Global Logistics Operations</p>
        <p className="mt-1">For support contact: n.solange@africaworldcargo.com</p>
      </div>
    </div>
  );
};

export default UserGuideView;