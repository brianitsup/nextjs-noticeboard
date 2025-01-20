import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LayoutGrid, 
  Users, 
  Search, 
  Tags, 
  Sparkles, 
  Smartphone,
  Target
} from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">About Notice Board</h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground">
              A modern digital platform designed to streamline the process of sharing public announcements, advertisements, and community updates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="row-span-2">
              <CardHeader>
                <Target className="h-8 w-8 mb-2" />
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                We aim to modernize traditional notice boards by providing a digital solution that makes information sharing more efficient, accessible, and organized for communities, businesses, and organizations.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <LayoutGrid className="h-8 w-8 mb-2" />
                <CardTitle>Easy Management</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Simple and intuitive interface for posting and managing notices.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Tags className="h-8 w-8 mb-2" />
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Well-organized notices with customizable categories.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="h-8 w-8 mb-2" />
                <CardTitle>Featured Notices</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Enhanced visibility with sponsored and featured notices.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Search className="h-8 w-8 mb-2" />
                <CardTitle>Smart Filtering</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Powerful search and filtering capabilities for quick access.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Smartphone className="h-8 w-8 mb-2" />
                <CardTitle>Responsive Design</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Modern interface that works seamlessly across all devices.
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <Users className="h-8 w-8 mb-2" />
                <CardTitle>Built for Everyone</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Whether you're a small community group, a large organization, or anything in between, 
                Notice Board provides the perfect platform for sharing important information with your audience.
                Our digital solution brings the traditional notice board into the modern era.
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 