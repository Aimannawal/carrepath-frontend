<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  photoUrl: {
    type: String,
    default: ''
  },
  templateId: {
    type: Number,
    default: 1
  }
})

// Color palettes for different templates
const themes = {
  1: { // Modern Blue
    primary: '#1E3A8A', // text-blue-900
    secondary: '#3B82F6', // text-blue-500
    bgSide: '#EFF6FF', // bg-blue-50
    textSide: '#1E40AF',
    accent: '#2563EB',
  },
  2: { // Elegant Dark
    primary: '#111827', // text-gray-900
    secondary: '#4B5563', // text-gray-600
    bgSide: '#1F2937', // bg-gray-800
    textSide: '#F9FAFB',
    accent: '#D1D5DB',
  },
  3: { // Vibrant Red
    primary: '#7F1D1D', // text-red-900
    secondary: '#DC2626', // text-red-600
    bgSide: '#FEF2F2', // bg-red-50
    textSide: '#991B1B',
    accent: '#EF4444',
  },
  4: { // Minimal Green
    primary: '#064E3B', // text-emerald-900
    secondary: '#059669', // text-emerald-600
    bgSide: '#F0FDF4', // bg-emerald-50
    textSide: '#065F46',
    accent: '#10B981',
  }
}

const currentTheme = computed(() => themes[props.templateId] || themes[1])

const downloadCreativeCvPdf = async () => {
  const element = document.getElementById('creative-cv-export')
  if (!element) return

  const printWindow = window.open('', '_blank', 'width=900,height=1200')
  if (!printWindow) return

  printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Resume</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    @media print {
      @page { size: A4 portrait; margin: 0; }
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  </style>
</head>
<body>
  ${element.outerHTML}
  <script>
    window.onload = () => { window.print(); window.close(); }
  <\/script>
</body>
</html>`)
  printWindow.document.close()
}

const initials = computed(() => {
  if (!props.data.name) return 'CV'
  return props.data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
})

const svgIcons = {
  envelope: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-full h-full"><path d="M3 4a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2H3zm14 2.207l-7 4.2-7-4.2V6l7 4.2 7-4.2v.207z"/></svg>`,
  phone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-full h-full"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>`,
  'map-pin': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-full h-full"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>`,
  'globe-alt': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-full h-full"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd"/></svg>`,
  user: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-full h-full"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>`,
  briefcase: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-full h-full"><path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd"/><path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/></svg>`,
  'academic-cap': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-full h-full"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/></svg>`,
  folder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-full h-full"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-full h-full"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`,
}

// Keywords blacklist - terms that are NOT real skills
const SKILL_BLACKLIST = [
  'frontend development', 'backend development', 'mobile app development',
  'mobile development', 'web development', 'application development',
  'frontend engineering', 'backend engineering', 'full-stack development',
  'fullstack development', 'software development', 'ui/ux design',
  'website development', 'app development', 'full stack development',
  'ios development', 'android development', 'cross-platform development',
]

const filterSkills = (skills) => {
  if (!Array.isArray(skills)) return []
  return skills.filter(s => {
    const lower = (s || '').toLowerCase().trim()
    return lower.length > 0 && !SKILL_BLACKLIST.includes(lower)
  })
}

const displayHardSkills = computed(() => {
  return filterSkills(props.data.hard_skills).slice(0, 12)
})

const displaySoftSkills = computed(() => {
  return filterSkills(props.data.soft_skills).slice(0, 6)
})
</script>

<template>
  <div class="creative-cv-wrapper" style="width: 100%; overflow-x: auto; background-color: #f1f5f9; padding: 20px; border-radius: 8px;">
    <!-- The actual export container -->
    <div id="creative-cv-export" class="cv-page shadow-lg bg-white mx-auto relative overflow-hidden" :style="{ width: '794px', minHeight: '1123px' }">
      
      <!-- Template 1: Modern Split Layout -->
      <div v-if="templateId === 1" class="flex h-full min-h-[1123px]" :style="{ background: `linear-gradient(to right, ${currentTheme.bgSide} 35%, white 35%)` }">
        <!-- Sidebar -->
        <div class="w-[35%] p-8 flex flex-col gap-6" :style="{ backgroundColor: 'transparent' }">
          <div class="flex justify-center mb-4">
            <div class="w-40 h-40 rounded-full overflow-hidden border-4 bg-white flex items-center justify-center shadow-md" :style="{ borderColor: currentTheme.secondary }">
              <img v-if="photoUrl" :src="photoUrl" class="w-full h-full object-cover" />
              <span v-else class="text-4xl font-bold" :style="{ color: currentTheme.primary }">{{ initials }}</span>
            </div>
          </div>
          
          <div class="contact-info text-sm space-y-3" :style="{ color: currentTheme.textSide }">
            <h3 class="font-bold text-lg uppercase border-b-2 pb-1 mb-3" :style="{ borderColor: currentTheme.accent }">Contact</h3>
            <div v-if="data.contact.email" class="flex items-start gap-2 break-all">
              <span class="inline-block w-5 h-5 shrink-0" v-html="svgIcons.envelope"></span>
              <span>{{ data.contact.email }}</span>
            </div>
            <div v-if="data.contact.phone" class="flex items-center gap-2">
              <span class="inline-block w-5 h-5" v-html="svgIcons.phone"></span>
              <span>{{ data.contact.phone }}</span>
            </div>
            <div v-if="data.contact.location" class="flex items-start gap-2">
              <span class="inline-block w-5 h-5 shrink-0" v-html="svgIcons['map-pin']"></span>
              <span>{{ data.contact.location }}</span>
            </div>
            <div v-if="data.contact.website" class="flex items-center gap-2">
              <span class="inline-block w-5 h-5" v-html="svgIcons['globe-alt']"></span>
              <span>{{ data.contact.website }}</span>
            </div>
          </div>
          
            <div v-if="displayHardSkills.length || displaySoftSkills.length" class="skills-info mt-4">
              <h3 class="font-bold text-lg uppercase border-b-2 pb-1 mb-3" :style="{ color: currentTheme.textSide, borderColor: currentTheme.accent }">Skills</h3>
              
              <div v-if="displayHardSkills.length" class="mb-3">
                <h4 class="text-[11px] uppercase tracking-wider mb-1.5 opacity-80" :style="{ color: currentTheme.textSide }">Hard Skills</h4>
                <div class="flex flex-wrap gap-1.5">
                  <span v-for="(skill, idx) in displayHardSkills" :key="'h'+idx" class="text-[11px] px-2 py-0.5 rounded text-white font-medium" :style="{ backgroundColor: currentTheme.secondary }">{{ skill }}</span>
                </div>
              </div>
              
              <div v-if="displaySoftSkills.length">
                <h4 class="text-[11px] uppercase tracking-wider mb-1.5 opacity-80" :style="{ color: currentTheme.textSide }">Soft Skills</h4>
                <div class="flex flex-wrap gap-1.5">
                  <span v-for="(skill, idx) in displaySoftSkills" :key="'s'+idx" class="text-[11px] px-2 py-0.5 rounded bg-white font-medium border" :style="{ color: currentTheme.secondary, borderColor: currentTheme.secondary }">{{ skill }}</span>
                </div>
              </div>
            </div>
          
          <div v-if="data.certifications.length" class="certs-info mt-4">
            <h3 class="font-bold text-lg uppercase border-b-2 pb-1 mb-3" :style="{ color: currentTheme.textSide, borderColor: currentTheme.accent }">Certificates</h3>
            <ul class="space-y-2 text-sm" :style="{ color: currentTheme.textSide }">
              <li v-for="(cert, idx) in data.certifications" :key="idx" class="flex gap-2">
                <span class="shrink-0 font-bold">•</span>
                <span>{{ cert }}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Main Content -->
        <div class="w-[65%] p-10 flex flex-col gap-6">
          <div class="header pb-6 border-b-2" :style="{ borderColor: currentTheme.bgSide }">
            <h1 class="text-4xl font-extrabold uppercase tracking-wide" :style="{ color: currentTheme.primary }">{{ data.name }}</h1>
            <h2 class="text-xl font-medium mt-2" :style="{ color: currentTheme.secondary }">{{ data.headline }}</h2>
          </div>
          
          <div v-if="data.summary" class="summary">
            <h3 class="font-bold text-xl uppercase mb-3 flex items-center gap-2" :style="{ color: currentTheme.primary }">
              <span class="inline-block w-6 h-6" v-html="svgIcons.user"></span> Profile
            </h3>
            <p class="text-gray-700 text-sm leading-relaxed">{{ data.summary }}</p>
          </div>
          
          <div v-if="data.experiences.length" class="experience">
            <h3 class="font-bold text-xl uppercase mb-4 flex items-center gap-2" :style="{ color: currentTheme.primary }">
              <span class="inline-block w-6 h-6" v-html="svgIcons.briefcase"></span> Experience
            </h3>
            <div class="space-y-5">
              <div v-for="(exp, idx) in data.experiences" :key="idx" class="relative pl-4 border-l-2" :style="{ borderColor: currentTheme.secondary }">
                <div class="absolute -left-[5px] top-1 w-2 h-2 rounded-full" :style="{ backgroundColor: currentTheme.secondary }"></div>
                <div class="flex justify-between items-baseline mb-1">
                  <h4 class="font-bold text-base text-gray-900">{{ exp.role }}</h4>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :style="{ backgroundColor: currentTheme.bgSide, color: currentTheme.textSide }">{{ exp.period }}</span>
                </div>
                <h5 class="italic text-sm mb-2" :style="{ color: currentTheme.secondary }">{{ exp.company }}</h5>
                <ul v-if="exp.bullets.length" class="space-y-1 mt-2">
                  <li v-for="(b, bIdx) in exp.bullets" :key="bIdx" class="text-sm text-gray-700 flex gap-2">
                    <span class="shrink-0" :style="{ color: currentTheme.secondary }">▸</span><span>{{ b }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div v-if="data.education.length" class="education">
            <h3 class="font-bold text-xl uppercase mb-4 flex items-center gap-2" :style="{ color: currentTheme.primary }">
              <span class="inline-block w-6 h-6" v-html="svgIcons['academic-cap']"></span> Education
            </h3>
            <div class="space-y-4">
              <div v-for="(edu, idx) in data.education" :key="idx">
                <div class="flex justify-between items-baseline">
                  <h4 class="font-bold text-base text-gray-900">{{ edu.school }}</h4>
                  <span class="text-xs font-medium text-gray-500">{{ edu.year }}</span>
                </div>
                <h5 class="text-sm text-gray-700">{{ edu.degree }}</h5>
              </div>
            </div>
          </div>
          
          <div v-if="data.projects.length" class="projects">
             <h3 class="font-bold text-xl uppercase mb-4 flex items-center gap-2" :style="{ color: currentTheme.primary }">
              <span class="inline-block w-6 h-6" v-html="svgIcons.folder"></span> Projects
            </h3>
            <div class="grid grid-cols-2 gap-4">
               <div v-for="(proj, idx) in data.projects" :key="idx" class="p-3 rounded-lg border" :style="{ borderColor: currentTheme.bgSide }">
                 <h4 class="font-bold text-sm text-gray-900">{{ proj.name }}</h4>
                 <p v-if="proj.tech_stack?.length" class="text-xs italic mb-2" :style="{ color: currentTheme.secondary }">{{ proj.tech_stack.join(', ') }}</p>
                 <p v-if="proj.description" class="text-xs text-gray-700 line-clamp-3">{{ proj.description }}</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Template 2: Elegant Dark Theme header -->
      <div v-if="templateId === 2" class="flex flex-col h-full min-h-[1123px] bg-white">
        <!-- Header Top -->
        <div class="p-10 text-white flex justify-between items-center" :style="{ backgroundColor: currentTheme.bgSide }">
          <div class="w-2/3">
             <h1 class="text-5xl font-light uppercase tracking-widest mb-2">{{ data.name }}</h1>
             <h2 class="text-xl tracking-wider" :style="{ color: currentTheme.accent }">{{ data.headline }}</h2>
          </div>
          <div class="w-32 h-32 rounded-full overflow-hidden border-2 border-white flex items-center justify-center bg-gray-200 shrink-0">
             <img v-if="photoUrl" :src="photoUrl" class="w-full h-full object-cover" />
             <span v-else class="text-3xl font-bold text-gray-800">{{ initials }}</span>
          </div>
        </div>
        
        <div class="flex flex-row p-8 gap-8">
           <!-- Left Column -->
           <div class="w-[65%] space-y-8">
              <div v-if="data.summary">
                <h3 class="text-lg font-bold uppercase tracking-wider mb-3 border-b pb-1" :style="{ color: currentTheme.primary, borderColor: currentTheme.secondary }">Profile</h3>
                <p class="text-sm text-gray-700 leading-relaxed">{{ data.summary }}</p>
              </div>
              
              <div v-if="data.experiences.length">
                <h3 class="text-lg font-bold uppercase tracking-wider mb-4 border-b pb-1" :style="{ color: currentTheme.primary, borderColor: currentTheme.secondary }">Professional Experience</h3>
                <div class="space-y-6">
                  <div v-for="(exp, idx) in data.experiences" :key="idx">
                    <div class="flex justify-between items-baseline mb-1">
                      <h4 class="font-bold text-gray-900">{{ exp.role }}</h4>
                      <span class="text-xs font-semibold text-gray-500">{{ exp.period }}</span>
                    </div>
                    <h5 class="text-sm italic mb-2" :style="{ color: currentTheme.secondary }">{{ exp.company }}</h5>
                    <ul v-if="exp.bullets.length" class="space-y-1">
                      <li v-for="(b, bIdx) in exp.bullets" :key="bIdx" class="text-sm text-gray-700 flex gap-2">
                        <span class="shrink-0 text-gray-400">•</span><span>{{ b }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div v-if="data.projects.length">
                 <h3 class="text-lg font-bold uppercase tracking-wider mb-4 border-b pb-1" :style="{ color: currentTheme.primary, borderColor: currentTheme.secondary }">Projects</h3>
                 <div class="space-y-4">
                   <div v-for="(proj, idx) in data.projects" :key="idx">
                     <h4 class="font-bold text-sm text-gray-900">{{ proj.name }}</h4>
                     <p v-if="proj.tech_stack?.length" class="text-xs italic text-gray-500 mb-1">{{ proj.tech_stack.join(', ') }}</p>
                     <p v-if="proj.description" class="text-sm text-gray-700">{{ proj.description }}</p>
                   </div>
                 </div>
              </div>
           </div>
           
           <!-- Right Column -->
           <div class="w-[35%] space-y-8">
              <div>
                <h3 class="text-lg font-bold uppercase tracking-wider mb-3 border-b pb-1" :style="{ color: currentTheme.primary, borderColor: currentTheme.secondary }">Contact</h3>
                <div class="space-y-3 text-sm text-gray-700">
                  <div v-if="data.contact.email" class="break-all">{{ data.contact.email }}</div>
                  <div v-if="data.contact.phone">{{ data.contact.phone }}</div>
                  <div v-if="data.contact.location">{{ data.contact.location }}</div>
                  <div v-if="data.contact.website" class="break-all">{{ data.contact.website }}</div>
                </div>
              </div>
              
              <div v-if="displayHardSkills.length || displaySoftSkills.length">
                <h3 class="text-lg font-bold uppercase tracking-wider mb-3 border-b pb-1" :style="{ color: currentTheme.primary, borderColor: currentTheme.secondary }">Expertise</h3>
                
                <div v-if="displayHardSkills.length" class="mb-4">
                  <h4 class="text-xs uppercase font-bold tracking-widest text-gray-500 mb-2">Hard Skills</h4>
                  <div class="flex flex-col gap-1.5">
                    <span v-for="(skill, idx) in displayHardSkills" :key="'h'+idx" class="text-sm text-gray-800 flex items-center gap-2">
                      <div class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: currentTheme.secondary }"></div>
                      {{ skill }}
                    </span>
                  </div>
                </div>

                <div v-if="displaySoftSkills.length">
                  <h4 class="text-xs uppercase font-bold tracking-widest text-gray-500 mb-2">Soft Skills</h4>
                  <div class="flex flex-col gap-1.5">
                    <span v-for="(skill, idx) in displaySoftSkills" :key="'s'+idx" class="text-sm text-gray-800 flex items-center gap-2">
                      <div class="w-1.5 h-1.5 rounded-full shrink-0 border border-gray-400"></div>
                      {{ skill }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div v-if="data.education.length">
                <h3 class="text-lg font-bold uppercase tracking-wider mb-3 border-b pb-1" :style="{ color: currentTheme.primary, borderColor: currentTheme.secondary }">Education</h3>
                <div class="space-y-4">
                  <div v-for="(edu, idx) in data.education" :key="idx">
                    <h4 class="font-bold text-sm text-gray-900">{{ edu.degree }}</h4>
                    <h5 class="text-sm text-gray-700">{{ edu.school }}</h5>
                    <span class="text-xs text-gray-500">{{ edu.year }}</span>
                  </div>
                </div>
              </div>
              
              <div v-if="data.certifications.length">
                <h3 class="text-lg font-bold uppercase tracking-wider mb-3 border-b pb-1" :style="{ color: currentTheme.primary, borderColor: currentTheme.secondary }">Certifications</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li v-for="(cert, idx) in data.certifications" :key="idx">
                    {{ cert }}
                  </li>
                </ul>
              </div>
           </div>
        </div>
      </div>

      <!-- Template 3: Professional Red Block -->
      <div v-if="templateId === 3" class="flex flex-col h-full min-h-[1123px] bg-white relative">
        <!-- Top Header Block -->
        <div class="px-12 py-10 flex items-center justify-between shadow-md" :style="{ backgroundColor: currentTheme.primary, color: 'white' }">
          <div class="w-3/4">
            <h1 class="text-4xl font-extrabold uppercase tracking-wide mb-1">{{ data.name }}</h1>
            <h2 class="text-xl font-medium tracking-wider opacity-90 mb-4" :style="{ color: currentTheme.bgSide }">{{ data.headline }}</h2>
            
            <div class="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium opacity-80">
              <span v-if="data.contact.email" class="flex items-center gap-1.5"><span class="inline-block w-3.5 h-3.5" v-html="svgIcons.envelope"></span> {{ data.contact.email }}</span>
              <span v-if="data.contact.phone" class="flex items-center gap-1.5"><span class="inline-block w-3.5 h-3.5" v-html="svgIcons.phone"></span> {{ data.contact.phone }}</span>
              <span v-if="data.contact.location" class="flex items-center gap-1.5"><span class="inline-block w-3.5 h-3.5" v-html="svgIcons['map-pin']"></span> {{ data.contact.location }}</span>
            </div>
          </div>
          
          <div class="w-28 h-28 rounded-full overflow-hidden shadow-xl border-4 shrink-0 bg-white flex justify-center items-center" :style="{ borderColor: currentTheme.secondary }">
            <img v-if="photoUrl" :src="photoUrl" class="w-full h-full object-cover" />
            <span v-else class="text-3xl font-bold" :style="{ color: currentTheme.primary }">{{ initials }}</span>
          </div>
        </div>

        <div class="flex flex-grow h-full" :style="{ background: 'linear-gradient(to left, #fcfcfc 33.333333%, white 33.333333%)' }">
          <!-- Left Column (Main Content) -->
          <div class="w-2/3 p-10 space-y-8">
            <div v-if="data.summary">
              <h3 class="text-lg font-bold uppercase tracking-widest mb-3 border-b-2 pb-1" :style="{ color: currentTheme.primary, borderColor: currentTheme.secondary }">
                Professional Summary
              </h3>
              <p class="text-gray-700 text-sm leading-relaxed text-justify">{{ data.summary }}</p>
            </div>
            
            <div v-if="data.experiences.length">
              <h3 class="text-lg font-bold uppercase tracking-widest mb-5 border-b-2 pb-1" :style="{ color: currentTheme.primary, borderColor: currentTheme.secondary }">
                Experience
              </h3>
              <div class="space-y-6">
                <div v-for="(exp, idx) in data.experiences" :key="idx">
                  <div class="flex justify-between items-baseline mb-1">
                    <h4 class="font-bold text-gray-900 text-base">{{ exp.role }}</h4>
                    <span class="text-xs font-bold px-2 py-1 rounded" :style="{ backgroundColor: currentTheme.bgSide, color: currentTheme.primary }">{{ exp.period }}</span>
                  </div>
                  <h5 class="font-medium text-sm mb-2" :style="{ color: currentTheme.secondary }">{{ exp.company }}</h5>
                  <ul v-if="exp.bullets.length" class="space-y-1.5 mt-2">
                    <li v-for="(b, bIdx) in exp.bullets" :key="bIdx" class="text-xs text-gray-700 flex gap-2 leading-relaxed">
                      <span class="shrink-0 font-bold" :style="{ color: currentTheme.secondary }">›</span><span>{{ b }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div v-if="data.projects.length">
              <h3 class="text-lg font-bold uppercase tracking-widest mb-4 border-b-2 pb-1" :style="{ color: currentTheme.primary, borderColor: currentTheme.secondary }">
                Projects
              </h3>
              <div class="space-y-5">
                <div v-for="(proj, idx) in data.projects" :key="idx">
                  <h4 class="font-bold text-sm text-gray-900">{{ proj.name }}</h4>
                  <p v-if="proj.tech_stack?.length" class="text-xs font-semibold mt-1 mb-1" :style="{ color: currentTheme.secondary }">{{ proj.tech_stack.join(' • ') }}</p>
                  <p v-if="proj.description" class="text-xs text-gray-700 leading-relaxed">{{ proj.description }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Right Column (Sidebar) -->
          <div class="w-1/3 p-10 space-y-8 h-full shadow-inner" :style="{ backgroundColor: 'transparent', borderLeft: `1px solid ${currentTheme.bgSide}` }">
            <div v-if="displayHardSkills.length || displaySoftSkills.length">
              <h3 class="text-base font-bold uppercase tracking-widest mb-4 border-b-2 pb-1" :style="{ color: currentTheme.primary, borderColor: currentTheme.secondary }">
                Skills
              </h3>
              
              <div v-if="displayHardSkills.length" class="mb-5">
                <h4 class="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Hard Skills</h4>
                <div class="flex flex-col gap-2">
                  <div v-for="(skill, idx) in displayHardSkills" :key="'h'+idx" class="text-xs font-medium text-gray-800 flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-sm shrink-0" :style="{ backgroundColor: currentTheme.secondary }"></div>
                    {{ skill }}
                  </div>
                </div>
              </div>

              <div v-if="displaySoftSkills.length">
                <h4 class="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Soft Skills</h4>
                <div class="flex flex-wrap gap-1.5">
                  <span v-for="(skill, idx) in displaySoftSkills" :key="'s'+idx" class="text-[10px] px-2 py-1 rounded-full text-gray-700 font-medium border border-gray-200 bg-white shadow-sm">
                    {{ skill }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="data.education.length">
              <h3 class="text-base font-bold uppercase tracking-widest mb-4 border-b-2 pb-1" :style="{ color: currentTheme.primary, borderColor: currentTheme.secondary }">
                Education
              </h3>
              <div class="space-y-4">
                <div v-for="(edu, idx) in data.education" :key="idx">
                  <h4 class="font-bold text-xs text-gray-900 mb-0.5">{{ edu.degree }}</h4>
                  <h5 class="text-xs text-gray-600 mb-1">{{ edu.school }}</h5>
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded" :style="{ backgroundColor: currentTheme.bgSide, color: currentTheme.primary }">{{ edu.year }}</span>
                </div>
              </div>
            </div>

            <div v-if="data.certifications.length">
              <h3 class="text-base font-bold uppercase tracking-widest mb-4 border-b-2 pb-1" :style="{ color: currentTheme.primary, borderColor: currentTheme.secondary }">
                Certifications
              </h3>
              <ul class="space-y-2 text-xs text-gray-700">
                <li v-for="(cert, idx) in data.certifications" :key="idx" class="flex gap-2">
                  <span class="font-bold" :style="{ color: currentTheme.secondary }">+</span>
                  <span>{{ cert }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Template 4: Minimal Centered -->
      <div v-if="templateId === 4" class="flex flex-col h-full min-h-[1123px] bg-white p-12">
        <div class="text-center border-b-4 pb-8 mb-8" :style="{ borderColor: currentTheme.bgSide }">
          <div class="w-28 h-28 mx-auto rounded-full overflow-hidden mb-4 shadow-lg border-2 bg-gray-100 flex items-center justify-center shrink-0" :style="{ borderColor: currentTheme.primary }">
            <img v-if="photoUrl" :src="photoUrl" class="w-full h-full object-cover" />
            <span v-else class="text-3xl font-bold" :style="{ color: currentTheme.primary }">{{ initials }}</span>
          </div>
          <h1 class="text-4xl font-light tracking-wide uppercase text-gray-900 mb-2">{{ data.name }}</h1>
          <h2 class="text-lg font-medium tracking-widest uppercase mb-4" :style="{ color: currentTheme.secondary }">{{ data.headline }}</h2>
          <div class="flex justify-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
            <span v-if="data.contact.email">{{ data.contact.email }}</span>
            <span v-if="data.contact.phone">{{ data.contact.phone }}</span>
            <span v-if="data.contact.location">{{ data.contact.location }}</span>
            <span v-if="data.contact.website">{{ data.contact.website }}</span>
          </div>
        </div>

        <div v-if="data.summary" class="mb-8 text-center max-w-3xl mx-auto">
          <p class="text-gray-700 leading-relaxed text-sm">{{ data.summary }}</p>
        </div>

        <div class="grid grid-cols-2 gap-12">
          <div>
             <div v-if="data.experiences.length">
                <h3 class="text-xl font-bold uppercase tracking-widest mb-6 flex items-center" :style="{ color: currentTheme.primary }">
                  Experience
                  <div class="flex-grow h-px ml-4" :style="{ backgroundColor: currentTheme.bgSide }"></div>
                </h3>
                <div class="space-y-6">
                  <div v-for="(exp, idx) in data.experiences" :key="idx">
                    <h4 class="font-bold text-gray-900 text-lg">{{ exp.role }}</h4>
                    <div class="flex justify-between items-center mb-2">
                      <h5 class="font-medium" :style="{ color: currentTheme.secondary }">{{ exp.company }}</h5>
                      <span class="text-xs text-gray-500 font-medium">{{ exp.period }}</span>
                    </div>
                    <ul v-if="exp.bullets.length" class="space-y-1">
                      <li v-for="(b, bIdx) in exp.bullets" :key="bIdx" class="text-sm text-gray-600 flex gap-2">
                        <span class="shrink-0">•</span><span>{{ b }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
             </div>
          </div>
          
          <div class="space-y-8">
             <div v-if="displayHardSkills.length || displaySoftSkills.length">
                <h3 class="text-xl font-bold uppercase tracking-widest mb-6 flex items-center" :style="{ color: currentTheme.primary }">
                  Skills
                  <div class="flex-grow h-px ml-4" :style="{ backgroundColor: currentTheme.bgSide }"></div>
                </h3>
                
                <div v-if="displayHardSkills.length" class="mb-5">
                  <h4 class="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Hard Skills</h4>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="(skill, idx) in displayHardSkills" :key="'h'+idx" class="text-xs px-3 py-1 rounded-full text-white font-medium" :style="{ backgroundColor: currentTheme.secondary }">
                      {{ skill }}
                    </span>
                  </div>
                </div>

                <div v-if="displaySoftSkills.length">
                  <h4 class="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Soft Skills</h4>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="(skill, idx) in displaySoftSkills" :key="'s'+idx" class="text-xs px-3 py-1 rounded-full text-gray-800 font-medium border" :style="{ backgroundColor: 'transparent', borderColor: currentTheme.bgSide }">
                      {{ skill }}
                    </span>
                  </div>
                </div>
             </div>

             <div v-if="data.education.length">
                <h3 class="text-xl font-bold uppercase tracking-widest mb-6 flex items-center" :style="{ color: currentTheme.primary }">
                  Education
                  <div class="flex-grow h-px ml-4" :style="{ backgroundColor: currentTheme.bgSide }"></div>
                </h3>
                <div class="space-y-4">
                  <div v-for="(edu, idx) in data.education" :key="idx">
                    <h4 class="font-bold text-gray-900">{{ edu.school }}</h4>
                    <h5 class="text-sm text-gray-700">{{ edu.degree }}</h5>
                    <p class="text-xs text-gray-500 mt-1">{{ edu.year }}</p>
                  </div>
                </div>
             </div>

             <div v-if="data.certifications.length">
                <h3 class="text-xl font-bold uppercase tracking-widest mb-6 flex items-center" :style="{ color: currentTheme.primary }">
                  Certifications
                  <div class="flex-grow h-px ml-4" :style="{ backgroundColor: currentTheme.bgSide }"></div>
                </h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li v-for="(cert, idx) in data.certifications" :key="idx" class="flex gap-2">
                     <span :style="{ color: currentTheme.secondary }">→</span> {{ cert }}
                  </li>
                </ul>
             </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
#creative-cv-export {
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}
.creative-cv-wrapper::-webkit-scrollbar {
  height: 8px;
}
.creative-cv-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

/* OVERRIDE TAILWIND OKLCH COLORS FOR HTML2CANVAS COMPATIBILITY */
#creative-cv-export .text-gray-900 { color: #111827 !important; }
#creative-cv-export .text-gray-800 { color: #1f2937 !important; }
#creative-cv-export .text-gray-700 { color: #374151 !important; }
#creative-cv-export .text-gray-600 { color: #4b5563 !important; }
#creative-cv-export .text-gray-500 { color: #6b7280 !important; }
#creative-cv-export .text-gray-400 { color: #9ca3af !important; }
#creative-cv-export .text-white { color: #ffffff !important; }
#creative-cv-export .bg-gray-100 { background-color: #f3f4f6 !important; }
#creative-cv-export .bg-gray-200 { background-color: #e5e7eb !important; }
#creative-cv-export .bg-gray-800 { background-color: #1f2937 !important; }
#creative-cv-export .bg-white { background-color: #ffffff !important; }
#creative-cv-export .border-white { border-color: #ffffff !important; }
#creative-cv-export .border-gray-200 { border-color: #e5e7eb !important; }
#creative-cv-export .border-gray-400 { border-color: #9ca3af !important; }
#creative-cv-export .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important; }
#creative-cv-export .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important; }
#creative-cv-export .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important; }
#creative-cv-export .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important; }
#creative-cv-export .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05) !important; }
</style>
