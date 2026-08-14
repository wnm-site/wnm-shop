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

  const categories = ["Dresses", "Accessories", "Men's Wear"];
  const features = [
    { label: "40% OFF", sub: "Summer Sale" },
    { label: "Free Shipping", sub: "Orders over ₹500" },
    { label: "Premium Quality", sub: "Carefully selected" },
    { label: "Secure Shopping", sub: "100% protected" },
  ];

  return (
    <section
      className="position-relative overflow-hidden text-white"
      style={{
        backgroundImage:
          "url(https://i.ibb.co/wjY0JKH/Gemini-Generated-Image-wr6x2ywr6x2ywr6x.webp)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "520px",
      }}
    >
      {/* Optimized overlay with backdrop blur */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          background: "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Main Content */}
      <div className="container position-relative h-100">
        <div className="row min-vh-50 align-items-center">

          {/* LEFT CONTENT */}
          <div className="col-12 col-lg-8">
            <div className="py-4 py-lg-6 text-center text-lg-start">

              {/* Small Label */}
              <div className="mb-3">
                <span className="badge bg-warning text-dark rounded-pill px-3 py-2 fw-semibold">
                  SUMMER COLLECTION 2026
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="display-3 display-lg-2 fw-bold mb-3 lh-1">
                Upgrade Your
                <br />
                <span className="text-warning">
                  Summer Style
                </span>
              </h1>

              {/* Description */}
              <p className="lead text-white-50 mb-4 mx-auto mx-lg-0" style={{ maxWidth: "500px" }}>
                Discover premium fashion designed for your perfect summer look.
              </p>

              {/* Offer */}
              <div className="mb-4">
                <div className="d-inline-flex align-items-center gap-2 bg-white text-dark rounded-pill px-3 py-2 shadow-sm">
                  <span className="badge bg-danger rounded-pill px-2">
                    SALE
                  </span>
                  <span className="fw-bold">Up to 40% OFF</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="d-grid d-sm-flex gap-2 justify-content-center justify-content-lg-start mb-4">

                <Button
                  variant="warning"
                  size="lg"
                  className="rounded-pill px-4 px-md-5 fw-bold shadow-sm"
                  onClick={() => navigate("/products")}
                >
                  Shop Now
                </Button>

                <Button
                  variant="outline-light"
                  size="lg"
                  className="rounded-pill px-4 px-md-5 fw-semibold"
                  onClick={() => navigate("/collection")}
                >
                  Explore Collection
                </Button>

              </div>

              {/* Shipping */}
              <div className="mb-4">
                <span className="badge bg-success bg-opacity-90 rounded-pill px-3 py-2 fw-normal">
                  FREE SHIPPING ON ORDERS OVER ₹999
                </span>
              </div>

              {/* Categories - Optimized without emojis */}
              <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-lg-start">
                {categories.map((category) => (
                  <span
                    key={category}
                    className="badge bg-dark bg-opacity-50 border border-light border-opacity-25 rounded-pill px-3 py-2 fw-normal"
                  >
                    {category}
                  </span>
                ))}
              </div>

            </div>
          </div>

          {/* RIGHT EMPTY SPACE */}
          <div className="col-lg-4 d-none d-lg-block" />

        </div>
      </div>

      {/* Bottom Info Bar - Optimized */}
      <div className="position-relative border-top border-light border-opacity-10">
        <div className="container">
          <div className="row g-3 py-3 text-center text-md-start">

            {features.map((feature, index) => (
              <div key={index} className="col-6 col-md-3">
                <small className="d-block text-warning fw-semibold">
                  {feature.label}
                </small>
                <small className="text-white-50">
                  {feature.sub}
                </small>
              </div>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
}