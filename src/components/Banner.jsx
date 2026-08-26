// import { Button } from 'react-bootstrap';

// export default function Banner() {
//   return (
//     <section 
//       className="py-5 mb-5" 
//       style={{ 
//         background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
//         borderRadius: '0 0 50px 50px',
//         position: 'relative',
//         overflow: 'hidden'
//       }}
//     >
//       {/* Decorative circles */}
//       <div 
//         style={{
//           position: 'absolute',
//           top: '-50%',
//           right: '-10%',
//           width: '500px',
//           height: '500px',
//           background: 'radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%)',
//           borderRadius: '50%'
//         }}
//       ></div>
//       <div 
//         style={{
//           position: 'absolute',
//           bottom: '-30%',
//           left: '-10%',
//           width: '400px',
//           height: '400px',
//           background: 'radial-gradient(circle, rgba(194,24,91,0.15) 0%, transparent 70%)',
//           borderRadius: '50%'
//         }}
//       ></div>

//       <div className="container text-center py-5 position-relative">
//         <span 
//           className="badge bg-warning text-dark mb-3 px-3 py-2"
//           style={{ fontSize: '0.85rem', letterSpacing: '1px' }}
//         >
//           ✨ NEW ARRIVALS 2026 ✨
//         </span>
//         <h1 
//           className="display-3 fw-bold mb-3" 
//           style={{ color: '#880e4f', fontFamily: 'Playfair Display, serif' }}
//         >
//           Elegance Redefined
//         </h1>
//         <p 
//           className="lead text-muted mb-4" 
//           style={{ maxWidth: '650px', margin: '0 auto', fontSize: '1.15rem' }}
//         >
//           Discover our exclusive collection of premium women's dresses — 
//           crafted with love, designed for you.
//         </p>
//         <div className="d-flex gap-3 justify-content-center flex-wrap">
//           <Button 
//             href="#collection" 
//             variant="danger" 
//             size="lg" 
//             className="px-5 py-3 rounded-pill shadow"
//             style={{ backgroundColor: '#c2185b', borderColor: '#c2185b' }}
//           >
//             🛍️ Shop Collection
//           </Button>
//           <Button 
//             href="#about" 
//             variant="outline-dark" 
//             size="lg" 
//             className="px-5 py-3 rounded-pill"
//           >
//             About Us
//           </Button>
//         </div>

//         {/* Stats */}
//         <div className="row mt-5 pt-4 justify-content-center">
//           <div className="col-6 col-md-3">
//             <h3 className="fw-bold" style={{ color: '#c2185b' }}>500+</h3>
//             <p className="text-muted small mb-0">Products</p>
//           </div>
//           <div className="col-6 col-md-3">
//             <h3 className="fw-bold" style={{ color: '#c2185b' }}>10K+</h3>
//             <p className="text-muted small mb-0">Happy Customers</p>
//           </div>
//           <div className="col-6 col-md-3">
//             <h3 className="fw-bold" style={{ color: '#c2185b' }}>4.8★</h3>
//             <p className="text-muted small mb-0">Average Rating</p>
//           </div>
//           <div className="col-6 col-md-3">
//             <h3 className="fw-bold" style={{ color: '#c2185b' }}>24/7</h3>
//             <p className="text-muted small mb-0">Support</p>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }



import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Banner() {
  const navigate = useNavigate();

  const bannerImage =
    "https://i.ibb.co/wjY0JKH/Gemini-Generated-Image-wr6x2ywr6x2ywr6x.webp";

  return (
    <section
      className="position-relative overflow-hidden text-white"
      style={{
        minHeight: "480px",
        backgroundImage: `url("${bannerImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
      />

      {/* Content */}
      <div className="container position-relative h-100">
        <div className="row align-items-center" style={{ minHeight: "480px" }}>
          <div className="col-12 col-lg-7">
            <div className="text-center text-lg-start py-5">
              <span className="badge bg-warning text-dark rounded-pill px-3 py-2 mb-3">
                SUMMER COLLECTION 2026
              </span>

              <h1 className="display-4 fw-bold mb-3">
                Upgrade Your
                <br />
                <span className="text-warning">Summer Style</span>
              </h1>

              <p className="lead text-white-50 mb-4">
                Premium fashion for your perfect summer look.
              </p>

              <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center justify-content-lg-start">
                <Button
                  variant="warning"
                  size="lg"
                  className="rounded-pill px-4 fw-bold"
                  onClick={() => navigate("/products")}
                >
                  Shop Now
                </Button>

                <Button
                  variant="outline-light"
                  size="lg"
                  className="rounded-pill px-4"
                  onClick={() => navigate("/collection")}
                >
                  Explore Collection
                </Button>
              </div>

              <div className="mt-4">
                <span className="badge bg-danger rounded-pill px-3 py-2">
                  UP TO 40% OFF
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

