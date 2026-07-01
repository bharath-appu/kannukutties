export default function SetupNotice() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg rounded-xl border bg-white p-8 text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Dribble</h1>
        <div className="mb-6 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
          <p className="font-semibold">Supabase not configured</p>
          <p className="mt-1">
            To get started, create a Supabase project and add your credentials to <code className="rounded bg-yellow-100 px-1">.env.local</code>.
          </p>
        </div>
        <div className="space-y-4 text-left text-sm text-gray-600">
          <div>
            <p className="font-semibold text-gray-900">Step 1: Create a Supabase project</p>
            <p>Go to{' '}
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:underline">supabase.com</a>
              {' '}and create a new project.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Step 2: Get your credentials</p>
            <p>In your project dashboard, go to Settings → API and copy your Project URL and anon key.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Step 3: Update .env.local</p>
            <div className="mt-1 rounded-lg bg-gray-100 p-3 font-mono text-xs">
              NEXT_PUBLIC_SUPABASE_URL=your_supabase_url<br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
            </div>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Step 4: Run the SQL schema</p>
            <p>Open SQL Editor in Supabase and paste the contents of{' '}
              <code className="rounded bg-gray-100 px-1">supabase_schema.sql</code>.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
