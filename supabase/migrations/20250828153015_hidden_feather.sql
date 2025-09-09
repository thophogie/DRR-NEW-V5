-- News
CREATE POLICY "Anyone can read published news"
  ON news FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can insert news"
  ON news FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update news"
  ON news FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete news"
  ON news FOR DELETE
  TO authenticated
  USING (true);

-- Services
CREATE POLICY "Anyone can read active services"
  ON services FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update services"
  ON services FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete services"
  ON services FOR DELETE
  TO authenticated
  USING (true);

-- Incident reports
CREATE POLICY "Authenticated users can read all incident reports"
  ON incident_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create incident reports"
  ON incident_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update incident reports"
  ON incident_reports FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

-- Gallery
CREATE POLICY "Anyone can read published gallery items"
  ON gallery FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can insert gallery"
  ON gallery FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update gallery"
  ON gallery FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete gallery"
  ON gallery FOR DELETE
  TO authenticated
  USING (true);

-- Pages
CREATE POLICY "Anyone can read published pages"
  ON pages FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can insert pages"
  ON pages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update pages"
  ON pages FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete pages"
  ON pages FOR DELETE
  TO authenticated
  USING (true);

-- Page sections
CREATE POLICY "Anyone can read active page sections"
  ON page_sections FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert page sections"
  ON page_sections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update page sections"
  ON page_sections FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete page sections"
  ON page_sections FOR DELETE
  TO authenticated
  USING (true);

-- Resources
CREATE POLICY "Anyone can read published resources"
  ON resources FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can insert resources"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update resources"
  ON resources FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete resources"
  ON resources FOR DELETE
  TO authenticated
  USING (true);

-- Emergency alerts
CREATE POLICY "Anyone can read active emergency alerts"
  ON emergency_alerts FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can insert emergency alerts"
  ON emergency_alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update emergency alerts"
  ON emergency_alerts FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete emergency alerts"
  ON emergency_alerts FOR DELETE
  TO authenticated
  USING (true);

-- Social posts
CREATE POLICY "Anyone can read published social posts"
  ON social_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can insert social posts"
  ON social_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update social posts"
  ON social_posts FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete social posts"
  ON social_posts FOR DELETE
  TO authenticated
  USING (true);

-- Navigation items
CREATE POLICY "Anyone can read active navigation items"
  ON navigation_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert navigation items"
  ON navigation_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update navigation items"
  ON navigation_items FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete navigation items"
  ON navigation_items FOR DELETE
  TO authenticated
  USING (true);

-- Organizational hierarchy
CREATE POLICY "Anyone can read active organizational hierarchy"
  ON organizational_hierarchy FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert organizational hierarchy"
  ON organizational_hierarchy FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update organizational hierarchy"
  ON organizational_hierarchy FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete organizational hierarchy"
  ON organizational_hierarchy FOR DELETE
  TO authenticated
  USING (true);

-- Key personnel
CREATE POLICY "Anyone can read active key personnel"
  ON key_personnel FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert key personnel"
  ON key_personnel FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update key personnel"
  ON key_personnel FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete key personnel"
  ON key_personnel FOR DELETE
  TO authenticated
  USING (true);

-- Emergency hotlines
CREATE POLICY "Anyone can read active emergency hotlines"
  ON emergency_hotlines FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert emergency hotlines"
  ON emergency_hotlines FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update emergency hotlines"
  ON emergency_hotlines FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete emergency hotlines"
  ON emergency_hotlines FOR DELETE
  TO authenticated
  USING (true);

-- System settings
CREATE POLICY "Anyone can read public settings"
  ON system_settings FOR SELECT
  USING (is_public = true);

CREATE POLICY "Authenticated users can read all settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert settings"
  ON system_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update settings"
  ON system_settings FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete settings"
  ON system_settings FOR DELETE
  TO authenticated
  USING (true);

-- Users
CREATE POLICY "Authenticated users can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (true);

-- About sections
CREATE POLICY "Anyone can read active about sections"
  ON about_sections FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert about sections"
  ON about_sections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update about sections"
  ON about_sections FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete about sections"
  ON about_sections FOR DELETE
  TO authenticated
  USING (true);

-- Weather data
CREATE POLICY "Anyone can read active weather data"
  ON weather_data FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert weather data"
  ON weather_data FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update weather data"
  ON weather_data FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete weather data"
  ON weather_data FOR DELETE
  TO authenticated
  USING (true);

-- Storage: gallery bucket
CREATE POLICY "Anyone can view gallery images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

CREATE POLICY "Authenticated users can upload gallery images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Authenticated users can update