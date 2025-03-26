// Script to create a test project in Supabase

const createTestProject = async () => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase URL or key");
      return;
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/projects`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        project_name: "Test Project",
        developer_name: "Test Developer",
        description: "This is a test project",
        website_url: "https://example.com",
        thumbnail_url:
          "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
        x: 100,
        y: 100,
        width: 50,
        height: 50,
        category: "Web App",
        email: "test@example.com",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to create test project: ${response.status} ${errorText}`,
      );
    }

    console.log("Test project created successfully!");
    return true;
  } catch (error) {
    console.error("Error creating test project:", error);
    return false;
  }
};

export { createTestProject };
