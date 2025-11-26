// Bootstrap modal ADA improvement
document.addEventListener("DOMContentLoaded", function() {
    $(document).on('show.bs.modal', '.modal', function () {
      $(this).removeAttr('inert', 'true');
    });
    $(document).on("hide.bs.modal", ".modal", function () {
      $(this).attr("inert", "");

      // Determine which navbar exists
      const navbarElement = $(".navbar").length ? $(".navbar") : $(".navbar-normal");

      if (!navbarElement.length) return; // Exit if no navbar elements exist

      navbarElement.css("outline", "none")
            .attr("tabindex", "-1")
            .focus();
    });
});