export const SITE_CONFIG = {
  brand: {
    bismillah: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
    title: 'BLEED FOR LIFE',
    subtitle: '15 Years of Humanity',
    fullTitle: 'Bleed for Life – 15 Years of Humanity',
    tagline: 'Your blood. Their breath.',
  },

  music: {
    src: '/music.mp3',
    enablePrompt: 'Tap to enable music',
    onLabel: 'Music On',
    offLabel: 'Music Off',
  },

  open: {
    tapPrompt: 'TAP TO OPEN',
    reopenPrompt: 'TAP TO REOPEN',
  },

  impact: {
    eyebrow: 'A Call To Sadqah',
    paigam: 'He gifted you strength & health. Give blood as Sadqah today.',
    scientificQuote: 'One donation. Endless reward — and a stranger’s lifelong dua.',
    pillars: ['3 Lives Saved', 'Endless Duas', '15 Mins'],
  },

  scratch: {
    headingBefore: 'One Date. One Life.',
    headingAfter: 'You’re Invited.',
    subtextBefore: 'Unfurling your invitation…',
    subtextAfter: 'See you there.',
    revealedDay: 'Sunday',
    revealedDateMain: '6 December 2026',
    revealedYear: '2026',
    revealedDate: 'SUNDAY, 6 DECEMBER 2026',
    revealedTime: '10:30 AM – 4:30 PM',
    saveButton: 'SAVE THE DATE',
    icsActionLabel: 'Download .ics',
    googleCalLabel: 'Google Calendar',
    threshold: 0.6,
    brushRadius: 20, // 40px diameter
  },

  event: {
    title: 'Bleed for Life Blood Donation Camp',
    cardTitle: 'Blood Donation Camp',
    dateDisplay: 'Sunday, 6 December 2026',
    timeDisplay: '10:30 AM – 4:30 PM',
    venueSociety: "K. M. E. Society's",
    venueName: "G. M. Momin Women's College",
    venueFullName: "K. M. E. Society's G. M. Momin Women's College",
    venueAddress: "K. M. E. Society's G. M. Momin Women's College, Thana Road, Bhiwandi",
    // December 6, 2026, 10:30 AM IST (UTC+05:30)
    targetIsoIst: '2026-12-06T10:30:00+05:30',
    // 10:30 AM - 4:30 PM IST in UTC for calendar links
    icsStartUtc: '20261206T050000Z',
    icsEndUtc: '20261206T110000Z',
    icsFilename: 'bleed-for-life-2026.ics',
    description: 'Bleed for Life – 15 Years of Humanity. Save 3 lives on 6 Dec.',
    notes: ['Eat light before donating.'],
    eventDayIst: '2026-12-06',
    venueCoords: {
      lat: 19.2945,
      lng: 73.0605,
      radiusMeters: 1200,
    },
  },

  countdown: {
    heading: 'Countdown',
    completedMessage: 'Camp is Live Today',
    units: {
      days: 'Days',
      hours: 'Hours',
      minutes: 'Mins',
      seconds: 'Secs',
    },
  },

  pledge: {
    eyebrow: 'Surprise for Story on Event Day',
    heading: 'Hero Story Pass',
    subtext: 'Add your selfie & get your honour card.',
    counterSuffix: 'heroes joined',
    nameLabel: 'Your Name',
    namePlaceholder: 'Full name',
    phoneLabel: 'Phone Number',
    phonePlaceholder: 'Mobile number',
    photoLabel: 'Donation / Certificate Selfie',
    cameraButton: 'Live Camera',
    uploadButton: 'Add Photo',
    captureButton: 'Click Selfie',
    cancelCameraButton: 'Cancel',
    removePhotoButton: 'Remove',
    bloodGroupLabel: 'Blood Group',
    bloodGroups: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', "Don't know"] as const,
    submitButton: 'CREATE MY HERO PASS',
    submittingButton: 'CREATING...',
    passTitle: 'HERO OF HUMANITY',
    passSubtitle: '15 Years of Humanity',
    downloadPassButton: 'Download Story Pass',
    shareStoryLabel: 'Share Story',
    storyHint: 'Download or share on your Story.',
    storyQuote: '“One gift of blood. A second chance at life.”',
    pledgeAnotherButton: 'Create Another Pass',
  },

  venue: {
    heading: 'Venue',
    mapEmbedUrl:
      "https://maps.google.com/maps?q=K.+M.+E.+Society's+G.+M.+Momin+Women's+College+Thana+Road+Bhiwandi&output=embed",
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=K.+M.+E.+Society's+G.+M.+Momin+Women's+College+Thana+Road+Bhiwandi",
    directionsButton: 'GET DIRECTIONS',
    callButton: 'CALL HELPLINE',
    quickTruths: ['15 Mins', 'Safe', 'Age 18–65 · 50 kg+'],
  },

  contact: {
    /**
     * Replace '[PHONE]' with the real helpline number (e.g. '+9198XXXXXXXX')
     */
    phone: '[PHONE]',
  },

  share: {
    eyebrow: 'A Gift Of Health',
    heading: 'Step Forward Today.',
    subtext: 'Don’t just wish for a better world — help build it.',
    excuseBoldLine:
      'Your good health is a gift. One donation gives someone another chance at life — and endless hope.',
    whatsappButton: 'INVITE A FRIEND',
    copyButton: 'COPY INVITE LINK',
    copiedButton: 'LINK COPIED',
    whatsappMessage:
      "Your good health is a gift — one donation gives someone another chance at life and endless hope. Join me at Bleed for Life on 6 Dec at K. M. E. Society's G. M. Momin Women's College, Bhiwandi!",
    urlFallback: 'https://bleedforlife.org',
  },

  final: {
    tapHeartHint: 'Tap the heart',
    pulseEyebrow: 'Al-Qur’an · 5:32',
    quranQuote: '“Whoever saves one life, it is as if he had saved all of mankind.”',
    cardStamp: '6 Dec 2026 · 10:30 AM · Bhiwandi',
    commitButton: 'I’M COMING',
    committedBadge: 'SEE YOU SUNDAY',
    ropeHint: 'Pull cord to close',
    closingText: 'Closing...',
    footer: 'Bleed for Life – 15 Years of Humanity',
  },
} as const;
