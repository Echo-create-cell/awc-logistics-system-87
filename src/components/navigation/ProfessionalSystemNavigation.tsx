import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Calculator, 
  Users, 
  Building, 
  FileText, 
  Shield,
  Activity,
  TrendingUp,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { User } from '@/types';

interface ProfessionalSystemNavigationProps {
  currentUser: User;
  onNavigate: (view: string, role?: string) => void;
}

const ProfessionalSystemNavigation = ({ currentUser, onNavigate }: ProfessionalSystemNavigationProps) => {
  
  // Define cross-platform access based on role hierarchy
  const getAccessibleDashboards = () => {
    const dashboards = [
      {
        id: 'admin',
        title: 'Executive Administration',
        description: 'Complete system oversight, user management, and strategic analytics',
        icon: Crown,
        color: 'from-violet-500 to-purple-600',
        bgGradient: 'from-violet-50 to-purple-100',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700',
        access: ['admin'],
        features: ['User Management', 'System Analytics', 'Executive Reports', 'Security Control']
      },
      {
        id: 'finance',
        title: 'Financial Management',
        description: 'Comprehensive accounting, financial analysis, and reporting system',
        icon: Calculator,
        color: 'from-emerald-500 to-green-600',
        bgGradient: 'from-emerald-50 to-green-100',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-700',
        access: ['admin', 'finance_officer'],
        features: ['Accounting Dashboard', 'Financial Reports', 'Cash Flow Analysis', 'Tax Reporting']
      },
      {
        id: 'sales',
        title: 'Sales Leadership',
        description: 'Sales performance monitoring, team management, and client analytics',
        icon: TrendingUp,
        color: 'from-blue-500 to-cyan-600',
        bgGradient: 'from-blue-50 to-cyan-100',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
        access: ['admin', 'sales_director', 'finance_officer'],
        features: ['Sales Analytics', 'Team Performance', 'Client Management', 'Revenue Tracking']
      },
      {
        id: 'partner',
        title: 'Partner Collaboration',
        description: 'Partnership insights, collaborative tools, and shared analytics',
        icon: Building,
        color: 'from-teal-500 to-cyan-600',
        bgGradient: 'from-teal-50 to-cyan-100',
        borderColor: 'border-teal-200',
        textColor: 'text-teal-700',
        access: ['admin', 'partner', 'sales_director', 'finance_officer'],
        features: ['Partnership Metrics', 'Collaborative Reports', 'Shared Analytics', 'Joint Planning']
      }
    ];

    return dashboards.filter(dashboard => 
      dashboard.access.includes(currentUser.role) || 
      currentUser.role === 'admin'
    );
  };

  const accessibleDashboards = getAccessibleDashboards();

  const handleDashboardNavigation = (dashboardId: string) => {
    // In a real application, this would navigate to different routes or update the main view
    const routes = {
      admin: '/?view=admin-dashboard',
      finance: '/?view=finance-accounting',
      sales: '/?view=sales-dashboard',
      partner: '/?view=partner-dashboard'
    };

    // Open in new tab for cross-platform access
    window.open(routes[dashboardId as keyof typeof routes], '_blank');
    onNavigate(dashboardId);
  };

  const getRolePermissionLevel = (dashboard: any) => {
    if (currentUser.role === 'admin') return 'Full Access';
    if (dashboard.access.includes(currentUser.role)) return 'Authorized Access';
    return 'Limited Access';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Professional System Navigation</h2>
        <p className="text-muted-foreground">
          Access cross-platform dashboards with role-based permissions for {currentUser.role.replace('_', ' ')}
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Shield className="h-4 w-4 text-primary" />
          <Badge variant="secondary">{currentUser.role.replace('_', ' ').toUpperCase()}</Badge>
          <span className="text-sm text-muted-foreground">
            • {accessibleDashboards.length} dashboards available
          </span>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accessibleDashboards.map((dashboard) => (
          <Card 
            key={dashboard.id}
            className={`bg-gradient-to-br ${dashboard.bgGradient} ${dashboard.borderColor} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group`}
            onClick={() => handleDashboardNavigation(dashboard.id)}
          >
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${dashboard.color} text-white shadow-lg`}>
                    <dashboard.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${dashboard.textColor}`}>
                      {dashboard.title}
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className="text-xs mt-1 bg-white/70"
                    >
                      {getRolePermissionLevel(dashboard)}
                    </Badge>
                  </div>
                </div>
                <ExternalLink className={`h-5 w-5 ${dashboard.textColor} group-hover:scale-110 transition-transform`} />
              </div>

              {/* Description */}
              <p className={`text-sm ${dashboard.textColor}/80 mb-4 leading-relaxed`}>
                {dashboard.description}
              </p>

              {/* Features */}
              <div className="mb-6">
                <p className={`text-xs font-medium ${dashboard.textColor} mb-2`}>Key Features:</p>
                <div className="grid grid-cols-2 gap-1">
                  {dashboard.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${dashboard.color}`} />
                      <span className={`text-xs ${dashboard.textColor}/70`}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Button
                className={`w-full bg-gradient-to-r ${dashboard.color} text-white hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDashboardNavigation(dashboard.id);
                }}
              >
                <span>Access {dashboard.title}</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Access Information */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2">Cross-Platform Access</h4>
              <p className="text-blue-700 text-sm leading-relaxed">
                Your current role ({currentUser.role.replace('_', ' ')}) provides access to {accessibleDashboards.length} professional dashboards. 
                Each dashboard offers specialized tools and reports tailored to your responsibilities and authorization level.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {accessibleDashboards.map((dashboard) => (
                  <Badge key={dashboard.id} variant="outline" className="text-blue-700 border-blue-300">
                    {dashboard.title}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF Report Access */}
      <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-900">Professional PDF Reports</p>
                <p className="text-sm text-emerald-700">Generate comprehensive business reports across all accessible dashboards</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-300"
              onClick={() => onNavigate('reports')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalSystemNavigation;