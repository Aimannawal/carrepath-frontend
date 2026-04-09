<template>
  <section class="w-full min-h-screen flex">
    
    <!-- Sidebar -->
    <nav class="w-64 bg-[#1E1E1E] text-white p-4">
      <h2 class="text-xl font-bold mb-6">CarrePath</h2>
      
      <ul class="space-y-3">
        <li class="hover:text-[#2b4db6] cursor-pointer">Dashboard</li>
        <li class="hover:text-[#2b4db6] cursor-pointer">Profile</li>
        <li class="hover:text-[#2b4db6] cursor-pointer">Settings</li>
      </ul>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 bg-gray-100 p-6">
      
      <!-- Header -->
      <header class="mb-6">
        <h1 class="text-2xl font-semibold">Dashboard</h1>
      </header>

      <!-- Content dari page -->
      <div>
        <slot />
      </div>

    </main>

  </section>
</template>