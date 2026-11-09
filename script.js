document.addEventListener("DOMContentLoaded", () => {
  const storyCard = document.querySelector(".story-card");
  if (!storyCard) return;

  let stories = [
    { category: "Gratitude", initial: "A", time: "Today", title: "A small moment of gratitude", text: "Today I noticed how beautiful a simple moment can be: sunlight falling across the kitchen table while we shared breakfast.", reactions: { "❤️": 12 } },
    { category: "Beautiful moments", initial: "M", time: "Yesterday", title: "The kindness of a stranger", text: "A stranger noticed I was struggling with my bags and stopped to help. It was a small gesture, but it made a difficult day feel lighter.", reactions: { "❤️": 8 } },
    { category: "Joy", initial: "J", time: "A few days ago", title: "Laughter around the table", text: "My family stayed at the table long after dinner, telling old stories and laughing until our cheeks hurt. I want to remember that sound.", reactions: { "❤️": 15 } },
    { category: "Miracles", initial: "S", time: "Last week", title: "A call at the right time", text: "Just when I felt alone, an old friend called to check in. We talked for an hour, and I remembered that care can find us unexpectedly.", reactions: { "❤️": 6 } },
    { category: "Hard days", initial: "R", time: "Recently", title: "Taking one step at a time", text: "This week has been heavier than I expected. I am proud that I asked for help and took today one small step at a time.", reactions: { "❤️": 9 } },
    { category: "Just sharing", initial: "L", time: "This morning", title: "A note to my future self", text: "You do not have to have everything figured out today. Keep going gently, and remember to notice the good things along the way.", reactions: { "❤️": 4 } }
  ];

  try {
    const savedStories = JSON.parse(localStorage.getItem("heartKeepsAnonymousStories") || "[]");
    if (Array.isArray(savedStories)) stories = stories.concat(savedStories);
  } catch (error) {
    console.warn("Saved stories could not be loaded.", error);
  }

  let currentIndex = 0;
  let selectedCategory = "All";
  const categoryButtons = [...document.querySelectorAll(".category-button")];
  const title = storyCard.querySelector("h3");
  const description = storyCard.querySelector(":scope > p");
  const avatar = storyCard.querySelector(".story-avatar");
  const meta = storyCard.querySelector(".story-meta");
  const reactionRow = storyCard.querySelector(".reaction-row");
  const notice = document.createElement("p");
  notice.className = "gentle-note";
  notice.setAttribute("role", "status");
  notice.setAttribute("aria-live", "polite");
  storyCard.after(notice);

  function visibleIndexes() {
    return stories.map((story, index) => ({ story, index }))
      .filter(({ story }) => selectedCategory === "All" || story.category === selectedCategory)
      .map(({ index }) => index);
  }

  function render() {
    const indexes = visibleIndexes();
    if (!indexes.includes(currentIndex)) currentIndex = indexes[0];
    const story = stories[currentIndex];
    title.textContent = story.title;
    description.textContent = story.text;
    avatar.textContent = story.initial;
    meta.children[1].textContent = story.anonymous
      ? `Shared anonymously · ${story.category.toLowerCase()}`
      : `Shared with ${story.category.toLowerCase()}`;
    meta.children[3].textContent = story.time;
    reactionRow.querySelectorAll("button").forEach((button) => {
      const emoji = button.getAttribute("aria-label") === "Send love" ? "❤️" : button.textContent.trim().split(/\s+/)[0];
      const count = story.reactions[emoji] || 0;
      let countSpan = button.querySelector("span");
      if (countSpan) countSpan.textContent = count;
      else if (count > 0) { countSpan = document.createElement("span"); countSpan.textContent = count; button.append(" ", countSpan); }
    });
    notice.textContent = `Story ${indexes.indexOf(currentIndex) + 1} of ${indexes.length}`;
  }

  categoryButtons.forEach((button) => button.addEventListener("click", () => {
    categoryButtons.forEach((item) => { item.classList.remove("active"); item.setAttribute("aria-pressed", "false"); });
    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");
    selectedCategory = button.dataset.category || "All";
    currentIndex = visibleIndexes()[0];
    render();
  }));

  reactionRow.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
    const emoji = button.getAttribute("aria-label") === "Send love" ? "❤️" : button.textContent.trim().split(/\s+/)[0];
    const story = stories[currentIndex];
    story.reactions[emoji] = (story.reactions[emoji] || 0) + 1;
    render();
  }));

  document.querySelectorAll(".story-pagination button").forEach((button, buttonIndex) => button.addEventListener("click", (event) => {
    event.preventDefault();
    const indexes = visibleIndexes();
    const position = indexes.indexOf(currentIndex);
    const step = buttonIndex === 0 ? -1 : 1;
    currentIndex = indexes[(position + step + indexes.length) % indexes.length];
    render();
  }));

  const shareForm = document.querySelector("#share-form");
  if (shareForm) {
    shareForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(shareForm);
      const newStory = {
        category: formData.get("category"),
        initial: "♡",
        time: "Just now",
        title: String(formData.get("title")).trim(),
        text: String(formData.get("text")).trim(),
        anonymous: true,
        reactions: { "❤️": 0 }
      };

      if (!newStory.title || !newStory.text) return;
      stories.push(newStory);
      try {
        const savedStories = JSON.parse(localStorage.getItem("heartKeepsAnonymousStories") || "[]");
        savedStories.push(newStory);
        localStorage.setItem("heartKeepsAnonymousStories", JSON.stringify(savedStories));
      } catch (error) {
        console.warn("This story could not be saved in this browser.", error);
      }

      selectedCategory = "All";
      currentIndex = stories.length - 1;
      categoryButtons.forEach((button) => {
        const active = button.dataset.category === "All";
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
      render();
      shareForm.reset();
      document.querySelector("#share-message").textContent = "Thank you. Your anonymous story is now shown in the stories above on this browser.";
      document.querySelector("#stories").scrollIntoView({ behavior: "smooth" });
    });
  }

  render();
});

