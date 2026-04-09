<script setup>
useHead({
  title: 'CarrePath | Name of Company',
})
</script>

<template>
  <section class="bg-[#F8F9FA] w-full min-h-screen flex items-center justify-center">

    <div class="flex flex-col items-start text-start gap-6">
      <h1 class="text-[24px] font-medium">
        What is your Company Name ?
      </h1>
      <form action="" class="w-full flex flex-col items-end gap-6">
        <div class="flex flex-col gap-3">
          <label for="Name" class="text-[14px]">Company Name</label>
          
          <div class="w-[420px] flex flex-row items-center px-5 py-5 rounded-[10px] border border-gray-300 gap-3 
                      focus-within:ring-2 focus-within:ring-[color:var(--color-main)] focus-within:border-transparent transition">
            
            <img src="/icons/company-gray.svg" alt="Company" class="w-5 h-5">
            
            <input 
              type="text" 
              id="Name" 
              name="Name"
              autocomplete="off" 
              placeholder="PT. Ramzi Membangun Indonesia" 
              class="w-full focus:outline-none placeholder:text-[14px] text-[14px]"
            >
          
          </div>
        </div>
    
        <div
              class=" cursor-pointer transition-all ease-in-out w-fit bg-[color:var(--color-main)] text-white px-[30px] py-[15px] rounded-[5px] text-[14px] font-normal hover:bg-blue-800 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-4">
              Next 
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="transform rotate-45">
                <path d="M2.625 11.375L11.375 2.625M11.375 2.625H4.8125M11.375 2.625V9.1875" stroke="white"
                  stroke-width="0.875" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
        </div>
      </form>
    </div>

  </section>
</template>