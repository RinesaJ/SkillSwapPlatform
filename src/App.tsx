import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster, toast } from "sonner";
import { FormEvent, useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold accent-text">Skill Exchange</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <Content />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const profile = useQuery(api.profiles.get, {});
  const skills = useQuery(api.skills.list, {}) || [];
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);

  if (profile === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Skill Exchange</h1>
        <p className="text-xl text-gray-600">Trade skills, grow together</p>
      </div>

      <Authenticated>
        {!profile ? (
          <CreateProfile />
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Skills Marketplace</h2>
              <button
                onClick={() => setShowSkillForm(!showSkillForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {showSkillForm ? "Close" : "Add Skill"}
              </button>
            </div>

            {showSkillForm && <AddSkillForm onSuccess={() => setShowSkillForm(false)} />}

            {selectedSkill ? (
              <MatchView skill={selectedSkill} onBack={() => setSelectedSkill(null)} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Available Skills</h2>
                  <div className="space-y-4">
                    {skills.filter(skill => skill.type === "offer").map(skill => (
                      <div key={skill._id} className="p-4 border rounded-lg">
                        <h3 className="font-semibold">{skill.name}</h3>
                        <p className="text-gray-600">{skill.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-blue-600">{skill.category}</span>
                          <button
                            onClick={() => setSelectedSkill(skill)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Find Matches
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Requested Skills</h2>
                  <div className="space-y-4">
                    {skills.filter(skill => skill.type === "request").map(skill => (
                      <div key={skill._id} className="p-4 border rounded-lg">
                        <h3 className="font-semibold">{skill.name}</h3>
                        <p className="text-gray-600">{skill.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-blue-600">{skill.category}</span>
                          <button
                            onClick={() => setSelectedSkill(skill)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Find Matches
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Authenticated>

      <Unauthenticated>
        <div className="max-w-md mx-auto">
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}

function MatchView({ skill, onBack }: { skill: any; onBack: () => void }) {
  const matches = useQuery(api.matches.findMatches, { skillId: skill._id }) || [];
  const initiateExchange = useMutation(api.matches.initiateExchange);

  async function handleInitiateExchange(matchSkill: any) {
    try {
      const exchangeId = await initiateExchange({
        offerId: skill.type === "offer" ? skill._id : matchSkill._id,
        requestId: skill.type === "request" ? skill._id : matchSkill._id,
      });
      toast.success("Exchange initiated!");
    } catch (error) {
      toast.error("Failed to initiate exchange");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-semibold">Matches for {skill.name}</h2>
      </div>

      {matches.length === 0 ? (
        <p className="text-gray-600">No matches found yet. Check back later!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map(({ match, profile }) => profile && (
            <div key={match._id} className="p-6 border rounded-lg">
              <div className="mb-4">
                <h3 className="text-xl font-semibold">{profile.name}</h3>
                <p className="text-gray-600">{profile.bio}</p>
                {profile.location && (
                  <p className="text-sm text-gray-500">📍 {profile.location}</p>
                )}
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Availability</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.availability.map((time, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {time}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Portfolio</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.portfolioLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Link {i + 1}
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Matching Skill</h4>
                <div className="p-3 bg-gray-50 rounded">
                  <h5 className="font-medium">{match.name}</h5>
                  <p className="text-sm text-gray-600">{match.description}</p>
                  <span className="text-sm text-blue-600">{match.category}</span>
                </div>
              </div>

              <button
                onClick={() => handleInitiateExchange(match)}
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Start Exchange
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateProfile() {
  const createProfile = useMutation(api.profiles.create);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    availability: [] as string[],
    portfolioLinks: [] as string[],
  });
  const [availabilityInput, setAvailabilityInput] = useState("");
  const [portfolioInput, setPortfolioInput] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await createProfile(formData);
      toast.success("Profile created successfully!");
    } catch (error) {
      toast.error("Failed to create profile");
    }
  }

  function addAvailability(e: FormEvent) {
    e.preventDefault();
    if (availabilityInput.trim()) {
      setFormData(prev => ({
        ...prev,
        availability: [...prev.availability, availabilityInput.trim()]
      }));
      setAvailabilityInput("");
    }
  }

  function addPortfolioLink(e: FormEvent) {
    e.preventDefault();
    if (portfolioInput.trim()) {
      setFormData(prev => ({
        ...prev,
        portfolioLinks: [...prev.portfolioLinks, portfolioInput.trim()]
      }));
      setPortfolioInput("");
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Create Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          placeholder="Bio"
          value={formData.bio}
          onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Location (Optional)"
          value={formData.location}
          onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
          className="w-full p-2 border rounded"
        />
        
        <div>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add availability (e.g., 'Weekends')"
              value={availabilityInput}
              onChange={e => setAvailabilityInput(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={addAvailability}
              type="button"
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.availability.map((time, i) => (
              <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">
                {time}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add portfolio link"
              value={portfolioInput}
              onChange={e => setPortfolioInput(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={addPortfolioLink}
              type="button"
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.portfolioLinks.map((link, i) => (
              <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">
                {link}
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Create Profile
        </button>
      </form>
    </div>
  );
}

function AddSkillForm({ onSuccess }: { onSuccess: () => void }) {
  const createSkill = useMutation(api.skills.create);
  const [formData, setFormData] = useState({
    type: "offer" as "offer" | "request",
    category: "",
    name: "",
    description: "",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await createSkill(formData);
      toast.success("Skill added successfully!");
      onSuccess();
    } catch (error) {
      toast.error("Failed to add skill");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg space-y-4 bg-gray-50">
      <div className="flex gap-4">
        <label className="flex items-center">
          <input
            type="radio"
            checked={formData.type === "offer"}
            onChange={() => setFormData(prev => ({ ...prev, type: "offer" }))}
            className="mr-2"
          />
          Offering
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            checked={formData.type === "request"}
            onChange={() => setFormData(prev => ({ ...prev, type: "request" }))}
            className="mr-2"
          />
          Requesting
        </label>
      </div>

      <input
        type="text"
        placeholder="Category (e.g., Programming, Design, Music)"
        value={formData.category}
        onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
        className="w-full p-2 border rounded"
        required
      />

      <input
        type="text"
        placeholder="Skill Name"
        value={formData.name}
        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
        className="w-full p-2 border rounded"
        required
      />

      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
        className="w-full p-2 border rounded"
        required
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Add Skill
      </button>
    </form>
  );
}
