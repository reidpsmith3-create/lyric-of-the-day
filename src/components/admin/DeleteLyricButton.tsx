"use client";

export default function DeleteLyricButton({
  lyricId,
}: {
  lyricId: number;
}) {
  return (
    <button
      type="submit"
      formAction={`/api/admin/lyrics/${lyricId}/delete`}
      formNoValidate
      onClick={(event) => {
        const confirmed = window.confirm(
          "Delete this lyric? This cannot be undone."
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
      className="rounded-full border border-red-900/20 px-5 py-3 text-sm font-semibold text-red-900 transition hover:bg-red-900/5"
    >
      Delete Lyric
    </button>
  );
}
