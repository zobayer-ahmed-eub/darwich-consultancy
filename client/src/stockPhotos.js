// Real, freely licensed Pexels photographs. Run `npm run download:photos` from repo root to self-host.
// CDN URLs work immediately; the downloader rewrites them to local /stock/*.jpg when downloaded.
export const stockPhotos = {
  "interior-minimal-wood": "https://images.pexels.com/photos/34959436/pexels-photo-34959436.jpeg?auto=compress&cs=tinysrgb&w=1800&h=1200&fit=crop",
  "interior-warm-contemporary": "/stock/interior-warm-contemporary.jpg",
  "interior-feature-wall": "/stock/interior-feature-wall.jpg",
  "wood-a-frame-bedroom": "/stock/wood-a-frame-bedroom.jpg",
  "wood-cabin-retreat": "/stock/wood-cabin-retreat.jpg",
  "wood-panelled-room": "/stock/wood-panelled-room.jpg"
};
export const interiorShots = [
 {src:stockPhotos['interior-minimal-wood'], title:'Modern Living Space'},
 {src:stockPhotos['interior-warm-contemporary'], title:'Contemporary Living Interior'},
 {src:stockPhotos['interior-feature-wall'], title:'Warm Wood Accent Living Room'}
];
export const woodShots = [
 {src:stockPhotos['wood-a-frame-bedroom'], title:'A-Frame Timber Bedroom'},
 {src:stockPhotos['wood-cabin-retreat'], title:'Wooden Cabin Living Interior'},
 {src:stockPhotos['wood-panelled-room'], title:'Wood-Panelled Bedroom Detail'}
];
