// Integration plugin for noscript extension
// @author Martin Stubenschrott
// @version 0.2

liberator.mappings.addUserMap([liberator.modes.NORMAL], ["<Leader>s"],
	"Toggle scripts temporarily on current web page",
	function() { noscriptOverlay.toggleCurrentPage(3); });

liberator.mappings.addUserMap([liberator.modes.NORMAL], ["<Leader>S"],
	"Toggle scripts permanently on current web page",
	function()
	{
		const ns = noscriptOverlay.ns;
		const url = ns.getQuickSite(content.document.documentURI, /*level*/ 3);
		noscriptOverlay.safeAllow(url, !ns.isJSEnabled(url), false);
	});

liberator.commands.addUserCommand(["nosc[ript]"],
	"Show noscript info",
	function() { liberator.echo(liberator.util.objectToString(noscriptOverlay.getSites(), true)) });
