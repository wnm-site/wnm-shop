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

