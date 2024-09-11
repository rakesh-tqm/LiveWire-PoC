<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>QME</title>
    @livewireStyles
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;600;700;900&display=swap" rel="stylesheet"/>
    {{-- <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp"></script> --}}
    {{-- <script src="https://cdn.tailwindcss.com"></script> --}}
    @vite('resources/css/app.css')
  </head>
  <body>
    <div :class="{ 'dark': isDark}">
      <div class="flex h-screen antialiased text-gray-900 bg-gray-100 dark:bg-dark dark:text-light">

        <!-- Sidebar -->
        <livewire:layout.sidebar />

        <div class="flex-1 h-full overflow-x-hidden overflow-y-auto">
          <!-- Navbar -->
          <livewire:layout.header />

          <!-- Main content -->
          <main>
            <!-- Content header -->
            {{$slot}}

          </main>

          <!-- Main footer -->
         <livewire:layout.footer />
        </div>
      </div>
    </div>
    @livewireScripts
  </body>
</html>