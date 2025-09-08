import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2,
  Users,
  BarChart3,
  FileSpreadsheet,
  TrendingUp,
  Eye,
  ArrowRight,
  DollarSign,
  PieChart
} from 'lucide-react';

interface FinanceNavigationPanelProps {
  userRole: string;
  onNavigate: (view: string) => void;
}

const FinanceNavigationPanel = ({ userRole, onNavigate }: FinanceNavigationPanelProps) => {
  const navigationOptions = [
    {
      id: 'admin-dashboard',
      title: 'Admin Financial Dashboard',
      description: 'Comprehensive administrative view with full system financial analytics',
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      features: ['System-wide Analytics', 'User Management Metrics', 'Revenue Analysis', 'Cost Breakdown'],
      accessible: ['admin', 'finance_officer'],
    },
    {
      id: 'partner-dashboard', 
      title: 'Partner Analytics View',
      description: 'Focused partner performance metrics and collaborative financial insights',
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100', 
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      features: ['Partner Revenue', 'Commission Tracking', 'Performance KPIs', 'Collaboration Metrics'],
      accessible: ['admin', 'finance_officer', 'partner'],
    },
    {
      id: 'reports-dashboard',
      title: 'Advanced Reports Center',
      description: 'Detailed financial reporting with Excel exports and PDF generation',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      features: ['Custom Reports', 'Excel Export', 'PDF Generation', 'Audit Trails'],
      accessible: ['admin', 'finance_officer', 'sales_director'],
    }
  ];

  const isAccessible = (accessible: string[]) => {
    return accessible.includes(userRole);
  };

  const handleNavigation = (optionId: string) => {
    switch (optionId) {
      case 'admin-dashboard':
        window.open('/?view=reports&role=admin', '_blank');
        break;
      case 'partner-dashboard':
        window.open('/?view=dashboard&role=partner', '_blank');
        break;
      case 'reports-dashboard':
        window.open('/?view=reports', '_blank');
        break;
      default:
        onNavigate(optionId);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <DollarSign className="h-6 w-6 text-primary" />
            Cross-Platform Financial Navigation
          </CardTitle>
          <p className="text-muted-foreground">
            Access integrated financial dashboards across admin, partner, and reporting systems
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {navigationOptions.map((option) => {
              const accessible = isAccessible(option.accessible);
              const IconComponent = option.icon;
              
              return (
                <Card
                  key={option.id}
                  className={`
                    relative overflow-hidden transition-all duration-300 cursor-pointer
                    ${accessible 
                      ? `hover:shadow-xl hover:scale-105 bg-gradient-to-br ${option.bgColor} ${option.borderColor} border-2` 
                      : 'opacity-60 cursor-not-allowed bg-gray-50 border-gray-200'
                    }
                  `}
                  onClick={() => accessible && handleNavigation(option.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${option.color}`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      {accessible ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                          Restricted
                        </Badge>
                      )}
                    </div>
                    <CardTitle className={`text-lg ${accessible ? option.textColor : 'text-gray-600'}`}>
                      {option.title}
                    </CardTitle>
                    <p className={`text-sm ${accessible ? 'text-gray-600' : 'text-gray-400'}`}>
                      {option.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        {option.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <PieChart className={`h-3 w-3 ${accessible ? option.textColor : 'text-gray-400'}`} />
                            <span className={accessible ? option.textColor : 'text-gray-400'}>
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                      {accessible && (
                        <Button 
                          size="sm" 
                          className={`
                            w-full mt-4 bg-gradient-to-r ${option.color} 
                            hover:opacity-90 text-white border-0
                            flex items-center gap-2
                          `}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigation(option.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          Open Dashboard
                          <ArrowRight className="h-4 w-4 ml-auto" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceNavigationPanel;