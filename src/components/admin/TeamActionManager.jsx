import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { createTeamActionImage, deleteTeamActionImage, fetchTeamActionImages } from "../../services/teamActionService";
// Storage is optional; we support base64 storage in DB if bucket is unavailable
import ImageUpload from "../common/ImageUpload";
import LoadingSpinner from "../common/LoadingSpinner";

export default function TeamActionManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState(null); // { file, preview, name }
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // existing slide when editing

  async function load() {
    setLoading(true);
    try {
      const data = await fetchTeamActionImages();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleUpload() {
    if (!image?.file || !image?.preview) return;
    setUploading(true);
    try {
      // Store base64 directly in DB (image_data)
      await createTeamActionImage({
        image_data: image.preview,
        heading: heading || null,
        description: description || null,
        sort_order: sortOrder ? Number(sortOrder) : null,
      });

      setHeading("");
      setDescription("");
      setSortOrder("");
      setImage(null);
      await load();
    } catch (e) {
      console.error(e);
      alert(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveEdit() {
    if (!editingItem) return;
    setUploading(true);
    try {
      const payload = {
        heading: heading || null,
        description: description || null,
        sort_order: sortOrder ? Number(sortOrder) : null,
      };
      // If a new image selected, use it; otherwise keep existing image data/url
      if (image?.preview) {
        payload.image_data = image.preview;
        // If you want to clear image_url when storing base64, set to null
        payload.image_url = editingItem.image_url || null;
      } else {
        if (editingItem.image_data) payload.image_data = editingItem.image_data;
        if (editingItem.image_url) payload.image_url = editingItem.image_url;
      }
      // Import updater lazily to avoid circular imports at top
      const { updateTeamActionImage } = await import("../../services/teamActionService");
      await updateTeamActionImage(editingItem.id, payload);
      setEditingItem(null);
      setShowModal(false);
      setHeading("");
      setDescription("");
      setSortOrder("");
      setImage(null);
      await load();
    } catch (e) {
      console.error(e);
      alert(e.message || "Update failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTeamActionImage(id);
      await load();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold mb-2">Our Team in Action</h3>
      <p className="text-sm text-slate-600 mb-4">Manage slideshow images and optional details.</p>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Add New Card */}
          <button
            type="button"
            onClick={() => {
              setImage(null);
              setHeading("");
              setDescription("");
              setSortOrder("");
              setEditingItem(null);
              setShowModal(true);
            }}
            className="border-2 border-dashed border-slate-300 rounded-xl h-44 flex items-center justify-center hover:border-slate-400 hover:bg-slate-50 transition-colors"
          >
            <div className="flex flex-col items-center text-slate-600">
              <Plus className="h-7 w-7 mb-2" />
              <span className="text-sm font-medium">Add New Image</span>
            </div>
          </button>

          {/* Existing Slide Cards */}
          {items.length === 0 ? (
            <div className="col-span-full text-sm text-slate-600">No slides yet.</div>
          ) : (
            items.map((item) => {
              const thumb = item.image_data || item.image_url;
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setEditingItem(item);
                    setHeading(item.heading || "");
                    setDescription(item.description || "");
                    setSortOrder(item.sort_order ?? "");
                    setImage(thumb ? { file: null, preview: thumb, name: item.heading || "image" } : null);
                    setShowModal(true);
                  }}
                >
                  <div className="h-44 bg-slate-100">
                    {thumb ? (
                      <img src={thumb} alt={item.heading || "slide"} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-medium mb-1">{item.heading || "(no heading)"}</div>
                    {item.description && (
                      <div className="text-xs text-slate-600 line-clamp-2">{item.description}</div>
                    )}
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add New Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6">
              <div className="mb-4">
                <h4 className="text-lg font-semibold">{editingItem ? 'Edit Slide' : 'Add Slide'}</h4>
                <p className="text-sm text-slate-600">{editingItem ? 'Update image or details.' : 'Select an image and add optional details.'}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="Heading (optional)"
                  className="border rounded px-3 py-2"
                />
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  placeholder="Sort order (optional)"
                  className="border rounded px-3 py-2"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="border rounded px-3 py-2 md:col-span-2"
                  rows={3}
                />
              </div>
              <div className="w-full">
                <ImageUpload
                  value={image}
                  onChange={setImage}
                  disabled={uploading}
                  placeholder="Slide image"
                  aspectRatio="16/9"
                  className="w-full"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                {editingItem ? (
                  <button
                    onClick={handleSaveEdit}
                    disabled={uploading}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700"
                  >
                    {uploading ? "Saving..." : "Save Changes"}
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      await handleUpload();
                      setShowModal(false);
                    }}
                    disabled={uploading || !image}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700"
                  >
                    {uploading ? "Uploading..." : "Add Slide"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
