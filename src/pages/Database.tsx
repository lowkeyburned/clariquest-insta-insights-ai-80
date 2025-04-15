
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database as DatabaseIcon, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  RefreshCw, 
  Users,
  User as UserIcon,
  MessageSquare,
  BarChart2,
  Plus,
  Trash2,
  Edit
} from "lucide-react";

const DatabasePage = () => {
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Database</h1>
          <p className="text-clari-muted mt-1">Manage and analyze your collected data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload size={16} />
            Import
          </Button>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export
          </Button>
          <Button className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90">
            <RefreshCw size={16} />
            Refresh Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-clari-darkCard">
          <TabsTrigger value="users" className="gap-1">
            <Users size={16} />
            Users
          </TabsTrigger>
          <TabsTrigger value="responses" className="gap-1">
            <MessageSquare size={16} />
            Responses
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1">
            <BarChart2 size={16} />
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-4">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User Database</CardTitle>
                  <CardDescription>All users contacted through Instagram</CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus size={16} />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex mb-4 gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-clari-muted" />
                  <Input 
                    placeholder="Search users..." 
                    className="pl-9 border-clari-darkAccent bg-clari-darkBg"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter size={16} />
                  Filter
                </Button>
              </div>
              
              <div className="border border-clari-darkAccent rounded-md overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-clari-darkAccent">
                      <th className="px-4 py-2 text-left text-sm">User ID</th>
                      <th className="px-4 py-2 text-left text-sm">Username</th>
                      <th className="px-4 py-2 text-left text-sm">Location</th>
                      <th className="px-4 py-2 text-left text-sm">Messages</th>
                      <th className="px-4 py-2 text-left text-sm">Response Rate</th>
                      <th className="px-4 py-2 text-left text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: "U1001", username: "user_fashion21", location: "New York, NY", messages: 5, rate: "80%" },
                      { id: "U1002", username: "style_hunter99", location: "Los Angeles, CA", messages: 3, rate: "33%" },
                      { id: "U1003", username: "miami_trendy", location: "Miami, FL", messages: 7, rate: "71%" },
                      { id: "U1004", username: "urban_explorer", location: "Chicago, IL", messages: 4, rate: "50%" },
                      { id: "U1005", username: "tech_enthusiast", location: "San Francisco, CA", messages: 6, rate: "67%" },
                      { id: "U1006", username: "fitness_goals", location: "Boston, MA", messages: 2, rate: "100%" },
                      { id: "U1007", username: "travel_addict", location: "Seattle, WA", messages: 5, rate: "40%" }
                    ].map((user, index) => (
                      <tr key={index} className="border-t border-clari-darkAccent">
                        <td className="px-4 py-3 text-sm">{user.id}</td>
                        <td className="px-4 py-3 text-sm">{user.username}</td>
                        <td className="px-4 py-3 text-sm">{user.location}</td>
                        <td className="px-4 py-3 text-sm">{user.messages}</td>
                        <td className="px-4 py-3 text-sm">{user.rate}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-clari-muted">Showing 7 of 245 users</p>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="responses" className="mt-4">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Survey Responses</CardTitle>
              <CardDescription>All responses collected from users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex mb-4 gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-clari-muted" />
                  <Input 
                    placeholder="Search responses..." 
                    className="pl-9 border-clari-darkAccent bg-clari-darkBg"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter size={16} />
                  Filter
                </Button>
              </div>
              
              <div className="border border-clari-darkAccent rounded-md overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-clari-darkAccent">
                      <th className="px-4 py-2 text-left text-sm">Response ID</th>
                      <th className="px-4 py-2 text-left text-sm">User</th>
                      <th className="px-4 py-2 text-left text-sm">Survey</th>
                      <th className="px-4 py-2 text-left text-sm">Date</th>
                      <th className="px-4 py-2 text-left text-sm">Completion</th>
                      <th className="px-4 py-2 text-left text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: "R2001", user: "user_fashion21", survey: "Product Feedback Q1", date: "2023-03-15", completion: "100%" },
                      { id: "R2002", user: "style_hunter99", survey: "Customer Satisfaction", date: "2023-03-17", completion: "85%" },
                      { id: "R2003", user: "miami_trendy", survey: "Market Research", date: "2023-03-18", completion: "100%" },
                      { id: "R2004", user: "urban_explorer", survey: "Product Feedback Q1", date: "2023-03-20", completion: "90%" },
                      { id: "R2005", user: "tech_enthusiast", survey: "Feature Requests", date: "2023-03-21", completion: "100%" }
                    ].map((response, index) => (
                      <tr key={index} className="border-t border-clari-darkAccent">
                        <td className="px-4 py-3 text-sm">{response.id}</td>
                        <td className="px-4 py-3 text-sm">{response.user}</td>
                        <td className="px-4 py-3 text-sm">{response.survey}</td>
                        <td className="px-4 py-3 text-sm">{response.date}</td>
                        <td className="px-4 py-3 text-sm">{response.completion}</td>
                        <td className="px-4 py-3 text-sm">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-clari-muted">Showing 5 of 156 responses</p>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-clari-darkCard border-clari-darkAccent">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New users added over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 border border-dashed border-clari-darkAccent rounded-md flex items-center justify-center">
                  <p className="text-clari-muted">User growth chart will appear here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-clari-darkCard border-clari-darkAccent">
              <CardHeader>
                <CardTitle>Response Rates</CardTitle>
                <CardDescription>Survey completion statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 border border-dashed border-clari-darkAccent rounded-md flex items-center justify-center">
                  <p className="text-clari-muted">Response rate chart will appear here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-clari-darkCard border-clari-darkAccent lg:col-span-2">
              <CardHeader>
                <CardTitle>Data Quality Metrics</CardTitle>
                <CardDescription>Quality assessment of collected data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  {[
                    { label: "Completeness", value: "92%", description: "Fields with valid data" },
                    { label: "Consistency", value: "87%", description: "Data without contradictions" },
                    { label: "Accuracy", value: "95%", description: "Verified accurate responses" },
                    { label: "Relevance", value: "89%", description: "Data matching research goals" }
                  ].map((metric, index) => (
                    <Card key={index} className="bg-clari-darkBg border-clari-darkAccent">
                      <CardContent className="p-4">
                        <p className="text-sm text-clari-muted">{metric.label}</p>
                        <p className="text-2xl font-bold mt-1">{metric.value}</p>
                        <p className="text-xs text-clari-muted mt-1">{metric.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="h-48 border border-dashed border-clari-darkAccent rounded-md flex items-center justify-center">
                  <p className="text-clari-muted">Data quality trend visualization will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default DatabasePage;
