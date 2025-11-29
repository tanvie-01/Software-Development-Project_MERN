import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const DoctorDetails = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await axios.get(
          `https://mindconnect-backend-afyf.onrender.com/api/doctors/${id}`
        );
        setDoctor(data);
      } catch (error) {
        console.error("Error fetching doctor details:", error);
      }
    };
    fetchDoctor();
  }, [id]);

  if (!doctor)
    return (
      <div className="text-center mt-20 text-xl font-semibold text-gray-500">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="container mx-auto max-w-4xl">
        <Link
          to="/dashboard"
          className="text-blue-600 hover:underline mb-4 inline-block font-medium"
        >
          ← Back to Dashboard
        </Link>

        {/* Doctor Info Card */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            {doctor.name}
            <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {doctor.doctorId}
            </span>
          </h1>
          <p className="text-xl text-blue-600 font-medium mb-1">
            {doctor.specialization}
          </p>
          <p className="text-sm text-gray-500 mb-4 font-semibold">
            {doctor.degree}
          </p>{" "}
          {/* নতুন */}
          <div className="text-gray-600 space-y-2 mb-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <p>
              <strong>🏥 Hospital:</strong> {doctor.currentHospital}
            </p>{" "}
            {/* নতুন */}
            <p>
              <strong>🎓 College:</strong> {doctor.medicalCollege}
            </p>{" "}
            {/* নতুন */}
            <p>
              <strong>📅 Experience:</strong> {doctor.experience}
            </p>
            <p>
              <strong>📞 Phone:</strong> {doctor.phone}
            </p>
            <p>
              <strong>💰 Fees:</strong> {doctor.feesPerConsultation} BDT
            </p>
          </div>
          {/* Rating Section... */}
        </div>

        {/* Only Reviews List (No Form Here) */}
        <div className="bg-white shadow-md rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Patient Reviews ({doctor.numReviews})
          </h3>
          {doctor.reviews.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              <p>No reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {doctor.reviews.map((review) => (
                <div
                  key={review._id}
                  className="border-b border-gray-100 pb-4 last:border-0"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                        {review.userName.charAt(0)}
                      </div>
                      <strong className="text-gray-800">
                        {review.userName}
                      </strong>
                    </div>
                    <div className="text-yellow-500 text-sm">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {review.comment}
                  </p>
                  <p className="text-xs text-gray-400 mt-2 text-right">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
