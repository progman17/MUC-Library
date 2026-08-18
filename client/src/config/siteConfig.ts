// ============================================================
//  🎨  WHITE-LABEL SITE CONFIGURATION
//  Edit this file to rebrand the app for a new client.
//  No other file needs to be touched for basic white-labeling.
// ============================================================

export const siteConfig = {
    // ── Identity ──────────────────────────────────────────────
    siteName: 'MUC Library',
    tagline: 'Your Gateway to Academic Excellence',
    websiteUrl: 'https://www.muc.edu.eg/',

    // ── Auth ──────────────────────────────────────────────────
    /** Only emails ending with this domain are allowed to log in. */
    allowedEmailDomain: '@muc.edu.eg',

    // ── Support ───────────────────────────────────────────────
    supportEmail: 'library@muc.edu.eg',
    supportPhone: '+20 xxx xxx xxxx',

    // ── Branding assets ───────────────────────────────────────
    /**
     * Navbar / tab logo.
     * Replace the file at this path to update the brand mark.
     * Recommended size: 40×40 px, transparent background.
     */
    logoPath: '/assets/logo.png',

    /**
     * Footer logo (typically wider / full wordmark).
     * Replace the file at this path to update the footer brand.
     */
    footerLogoPath: '/assets/footer-logo.png',

    // ── Social Links ──────────────────────────────────────────
    socialLinks: {
        facebook: 'https://www.facebook.com/MayUniversityCairo',
        linkedin: 'https://www.linkedin.com/school/may-university-in-cairo/posts/?feedView=all',
        youtube: 'https://www.youtube.com/@mayuniversityincairo6810',
        instagram: 'https://www.instagram.com/mayuniversityincairo/',
    },

    // ── About / Developers Page ───────────────────────────────
    about: {
        /** Main heading shown at the top of the About page. */
        projectTitle: 'MUC Engineering Library',

        /** Short paragraph describing the system. */
        projectDescription:
            'MUC Library System is a comprehensive digital library designed to serve the entire university community, ' +
            'providing centralized access to academic resources across multiple colleges. The system supports digital ' +
            'materials, physical library references, and shared scientific and humanities resources, ensuring efficient ' +
            'access for students and administrators.',

        // ── Supervision section ────────────────────────────────
        /**
         * Set to `false` to completely hide the supervision block.
         * Useful for clients who don't have academic supervisors.
         */
        showSupervisionSection: true,

        supervisors: [
            'Prof Dr : Mohamed Abdelsalam',
            'Dr. Hassan Ibrahim',
            'Dr. Seham Muawad',
            'Eng. Yasmin Abdelnaby',
        ],

        // ── Lead Developer card ────────────────────────────────
        leadDeveloper: {
            name: 'Ayman Shaaban',
            title: 'Full-Stack Developer & Software Architect',
            badge: 'Computer Engineering — MUC',
            bio:
                'Dedicated to building high-performance digital solutions. This project was developed ' +
                'with a focus on seamless user experience and robust architecture to serve our academic community.',

            /** Path to the developer's portrait photo inside /public. */
            photoPath: '/developer.png',

            contacts: {
                whatsapp: 'https://wa.me/201156637548',
                email: 'mailto:aymankhattap2021@gmail.com',
                linkedin: 'https://www.linkedin.com/in/ayman-shaaban-204516273/',
            },

            /** Text shown in the small footer signature line. */
            footerSignature: 'Built with ♥ by Ayman Shaaban · MUC Computer Engineering · 2026',
        },
    },
} as const;
