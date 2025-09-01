import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <ErrorBoundary>
      <DatabaseProvider>
        <AuthProvider>
          <DataProvider>
            <PagesProvider>
              <Router future={{ v7_relativeSplatPath: true }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<PublicLayout />}>
                    <Route index element={<Home />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="services-detail" element={<ServicesPage />} />
                    <Route path="news-portal" element={<NewsPage />} />
                    <Route path="resources" element={<ResourcesPage />} />
                    <Route path="disaster-planning" element={<DisasterPlanPage />} />
                    <Route path="gallery" element={<Gallery />} />
                    <Route path="video-gallery" element={<VideoGallery />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="evacuation-generator" element={<EvacuationGenerator />} />
                    <Route path="evacuation-centers" element={<EvacuationList />} />
                    <Route path="iec-materials" element={<IECMaterials />} />
                    <Route path="council-staff" element={<CouncilAndStaff />} />
                    <Route path="volunteer" element={<VolunteerProgram />} />
                    <Route path="faq" element={<FAQ />} />
                    <Route path="go-bag-builder" element={<GoBagBuilder />} />
                    <Route path=":slug" element={<DynamicPage />} />
                  </Route>

                  {/* Admin Login */}
                  <Route path="/admin/login" element={<Login />} />

                  {/* Supabase Setup */}
                  <Route path="/admin/setup" element={<SupabaseSetup />} />

                  {/* Protected Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="emergency" element={<EmergencyManagement />} />
                    <Route path="hotlines" element={<EmergencyHotlineManagement />} />
                    <Route path="news" element={<NewsManagement />} />
                    <Route path="services" element={<ServicesManagement />} />
                    <Route path="about" element={<AboutManagement />} />
                    <Route path="gallery" element={<GalleryManagement />} />
                    <Route path="videos" element={<VideoManagement />} />
                    <Route path="social" element={<SocialMediaManagement />} />
                    <Route path="pages" element={<PagesManagement />} />
                    <Route path="resources" element={<ResourcesManagement />} />
                    <Route path="navigation" element={<NavigationManagement />} />
                    <Route path="users" element={<UsersManagement />} />
                    <Route path="incidents" element={<IncidentReports />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Routes>
              </Router>
            </PagesProvider>
          </DataProvider>
        </AuthProvider>
      </DatabaseProvider>
    </ErrorBoundary>
  );
}
