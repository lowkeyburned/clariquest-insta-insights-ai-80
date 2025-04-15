
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Search, 
  Compass, 
  Users, 
  AlertCircle, 
  CircleSlash, 
  CheckCircle2,
  Save
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const LocationTargeting = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSaveLocation = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Location cannot be empty",
        description: "Please enter a location to target.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Location saved",
      description: `${searchQuery} has been added to your targeted locations.`,
    });
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Location Targeting</h1>
          <p className="text-clari-muted mt-1">Target Instagram users by specific locations</p>
        </div>
        <Button className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90">
          <Compass size={16} />
          Current Locations
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Location Search</CardTitle>
              <CardDescription>Find and target specific locations for your Instagram campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-clari-muted" />
                <Input 
                  placeholder="Search for a city, neighborhood, or place of interest" 
                  className="pl-10 border-clari-darkAccent bg-clari-darkBg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {["New York", "Los Angeles", "Chicago", "Miami", "San Francisco"].map((location, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    className="gap-1"
                    onClick={() => setSearchQuery(location)}
                  >
                    <MapPin size={14} />
                    {location}
                  </Button>
                ))}
              </div>
              
              <div className="bg-clari-darkBg border border-clari-darkAccent rounded-md h-64 relative">
                {/* Map placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={40} className="mx-auto mb-2 text-clari-muted" />
                    <p className="text-clari-muted">Location map will appear here</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="radius">Radius (miles)</Label>
                  <Input 
                    id="radius" 
                    type="number" 
                    placeholder="10" 
                    className="border-clari-darkAccent bg-clari-darkBg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="estimated-users">Estimated Users</Label>
                  <Input 
                    id="estimated-users" 
                    readOnly 
                    value="~5,000 users" 
                    className="border-clari-darkAccent bg-clari-darkBg"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button 
                    className="w-full gap-2 bg-clari-gold text-black hover:bg-clari-gold/90"
                    onClick={handleSaveLocation}
                  >
                    <Save size={16} />
                    Save Location
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Location Analytics</CardTitle>
              <CardDescription>User engagement metrics by location</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="engagement">
                <TabsList className="bg-clari-darkBg w-full justify-start">
                  <TabsTrigger value="engagement">Engagement</TabsTrigger>
                  <TabsTrigger value="demographics">Demographics</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                
                <TabsContent value="engagement" className="mt-4">
                  <div className="border border-clari-darkAccent rounded-md overflow-hidden">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-clari-darkAccent">
                          <th className="px-4 py-2 text-left text-sm">Location</th>
                          <th className="px-4 py-2 text-left text-sm">Messages Sent</th>
                          <th className="px-4 py-2 text-left text-sm">Response Rate</th>
                          <th className="px-4 py-2 text-left text-sm">Avg. Engagement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { location: "New York, NY", sent: 1245, rate: "24%", engagement: "High" },
                          { location: "Los Angeles, CA", sent: 982, rate: "18%", engagement: "Medium" },
                          { location: "Chicago, IL", sent: 754, rate: "22%", engagement: "Medium" },
                          { location: "Miami, FL", sent: 621, rate: "27%", engagement: "High" },
                          { location: "San Francisco, CA", sent: 532, rate: "20%", engagement: "Medium" }
                        ].map((item, index) => (
                          <tr key={index} className="border-t border-clari-darkAccent">
                            <td className="px-4 py-3 text-sm">{item.location}</td>
                            <td className="px-4 py-3 text-sm">{item.sent}</td>
                            <td className="px-4 py-3 text-sm">{item.rate}</td>
                            <td className="px-4 py-3 text-sm">{item.engagement}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                
                <TabsContent value="demographics" className="mt-4">
                  <div className="h-48 border border-dashed border-clari-darkAccent rounded-md flex items-center justify-center">
                    <p className="text-clari-muted">Demographics visualization will appear here</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="activity" className="mt-4">
                  <div className="h-48 border border-dashed border-clari-darkAccent rounded-md flex items-center justify-center">
                    <p className="text-clari-muted">Activity visualization will appear here</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Saved Locations</CardTitle>
              <CardDescription>Your currently saved target locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "New York, NY", status: "Active", radius: "10 miles", users: 5200 },
                  { name: "Los Angeles, CA", status: "Active", radius: "15 miles", users: 4100 },
                  { name: "Chicago, IL", status: "Paused", radius: "8 miles", users: 2800 },
                  { name: "Miami, FL", status: "Active", radius: "12 miles", users: 3400 },
                  { name: "Boston, MA", status: "Inactive", radius: "5 miles", users: 1900 }
                ].map((location, index) => (
                  <div key={index} className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-clari-gold" />
                          <p className="font-medium text-sm">{location.name}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {location.status === "Active" ? (
                            <CheckCircle2 size={12} className="text-green-500" />
                          ) : location.status === "Paused" ? (
                            <AlertCircle size={12} className="text-yellow-500" />
                          ) : (
                            <CircleSlash size={12} className="text-red-500" />
                          )}
                          <p className="text-xs text-clari-muted">{location.status}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs">{location.radius}</p>
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          <Users size={12} className="text-clari-muted" />
                          <p className="text-xs text-clari-muted">{location.users}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="ghost" className="w-full text-clari-gold">Manage All Locations</Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Location Insights</CardTitle>
              <CardDescription>AI-generated insights about your targeted locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <h3 className="font-medium text-sm text-clari-gold mb-1">New York Engagement</h3>
                  <p className="text-xs">Users in New York show 28% higher engagement with survey content related to urban lifestyle products.</p>
                </div>
                
                <div className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <h3 className="font-medium text-sm text-clari-gold mb-1">Los Angeles Demographics</h3>
                  <p className="text-xs">Los Angeles users are primarily in the 25-34 age range and show high interest in fitness and entertainment topics.</p>
                </div>
                
                <div className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <h3 className="font-medium text-sm text-clari-gold mb-1">Response Rate Analysis</h3>
                  <p className="text-xs">Miami shows the highest response rates at 27%, suggesting content resonates well with this demographic.</p>
                </div>
                
                <div className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <h3 className="font-medium text-sm text-clari-gold mb-1">Recommended Action</h3>
                  <p className="text-xs">Increase targeting in Miami and similar demographic areas to maximize survey participation rates.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default LocationTargeting;
