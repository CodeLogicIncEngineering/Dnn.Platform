// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.
// See the LICENSE file in the project root for more information
namespace DotNetNuke.UI.Skins.Controls
{
    using System;
    using System.Text;
    using System.Text.RegularExpressions;

    using DotNetNuke.Abstractions;
    using DotNetNuke.Abstractions.Portals;
    using DotNetNuke.Common;
    using DotNetNuke.Common.Utilities;
    using DotNetNuke.Entities.Tabs;
    using Microsoft.Extensions.DependencyInjection;

    /// <summary>A skin/theme object which displays the hierarchy of the current page.</summary>
    public partial class BreadCrumb : SkinObjectBase
    {
        private const string UrlRegex = "(href|src)=(\\\"|'|)(.[^\\\"']*)(\\\"|'|)";
        private readonly INavigationManager navigationManager;
        private string separator = "<img alt=\"breadcrumb separator\" src=\"" + Globals.ApplicationPath + "/images/breadcrumb.gif\">";
        private string cssClass = "SkinObject";
        private int rootLevel;
        private bool showRoot;
        private string homeUrl = string.Empty;
        private string homeTabName = "Root";

        public BreadCrumb()
        {
            this.navigationManager = Globals.GetCurrentServiceProvider().GetRequiredService<INavigationManager>();
            this.CleanerMarkup = false;
        }

        public int ProfileUserId
        {
            get
            {
                return string.IsNullOrEmpty(this.Request.Params["UserId"])
                    ? Null.NullInteger
                    : int.Parse(this.Request.Params["UserId"]);
            }
        }

        public int GroupId
        {
            get
            {
                return string.IsNullOrEmpty(this.Request.Params["GroupId"])
                    ? Null.NullInteger
                    : int.Parse(this.Request.Params["GroupId"]);
            }
        }

        public string Separator
        {
            get { return this.separator; }
            set { this.separator = value; }
        }

        public string CssClass
        {
            get { return this.cssClass; }
            set { this.cssClass = value; }
        }

        public string RootLevel
        {
            get
            {
                return this.rootLevel.ToString();
            }

            set
            {
                this.rootLevel = int.Parse(value);
                if (this.rootLevel < 0)
                {
                    this.showRoot = true;
                    this.rootLevel = 0;
                }
            }
        }

        public bool UseTitle { get; set; }

        public bool HideWithNoBreadCrumb { get; set; }

        public bool CleanerMarkup { get; set; }

        private IPortalAliasInfo CurrentPortalAlias => this.PortalSettings.PortalAlias;

        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);

            var position = 1;
            var breadcrumb = new StringBuilder();

            this.ResolveSeparatorPaths();

            if (this.HideWithNoBreadCrumb && this.PortalSettings.ActiveTab.BreadCrumbs.Count == (this.rootLevel + 1))
            {
                return;
            }

            var crumbCount = this.PortalSettings.ActiveTab.BreadCrumbs.Count;
            var listItemIndex = 0;

            if (this.showRoot && this.PortalSettings.ActiveTab.TabID != this.PortalSettings.HomeTabId)
            {
                this.homeUrl = Globals.AddHTTP(this.CurrentPortalAlias.HttpAlias);

                if (this.PortalSettings.HomeTabId != -1)
                {
                    this.homeUrl = this.navigationManager.NavigateURL(this.PortalSettings.HomeTabId);

                    var tc = new TabController();
                    var homeTab = tc.GetTab(this.PortalSettings.HomeTabId, this.PortalSettings.PortalId, false);
                    this.homeTabName = homeTab.LocalizedTabName;

                    if (this.UseTitle && !string.IsNullOrEmpty(homeTab.Title))
                    {
                        this.homeTabName = homeTab.Title;
                    }
                }

                var hasMoreAfterRoot = crumbCount > this.rootLevel;

                breadcrumb.Append("<li itemprop=\"itemListElement\" itemscope itemtype=\"https://schema.org/ListItem\">");
                breadcrumb.Append("<a href=\"" + this.homeUrl + "\" class=\"" + this.cssClass + "\" itemprop=\"item\"><span itemprop=\"name\">" + this.homeTabName + "</span></a>");
                breadcrumb.Append("<meta itemprop=\"position\" content=\"" + position++ + "\" />");

                if (hasMoreAfterRoot)
                {
                    breadcrumb.Append("<span aria-hidden=\"true\">");
                    breadcrumb.Append(this.separator);
                    breadcrumb.Append("</span>");
                }

                breadcrumb.Append("</li>");
            }

            for (var i = this.rootLevel; i < crumbCount; ++i)
            {
                var tab = (TabInfo)this.PortalSettings.ActiveTab.BreadCrumbs[i];

                var tabName = tab.LocalizedTabName;

                if (this.UseTitle && !string.IsNullOrEmpty(tab.Title))
                {
                    tabName = tab.Title;
                }

                var tabUrl = tab.FullUrl;

                if (this.ProfileUserId > -1)
                {
                    tabUrl = this.navigationManager.NavigateURL(tab.TabID, string.Empty, "UserId=" + this.ProfileUserId);
                }

                if (this.GroupId > -1)
                {
                    tabUrl = this.navigationManager.NavigateURL(tab.TabID, string.Empty, "GroupId=" + this.GroupId);
                }

                var isLastCrumb = i == crumbCount - 1;
                var liAriaCurrent = isLastCrumb ? " aria-current=\"page\"" : string.Empty;

                breadcrumb.Append("<li itemprop=\"itemListElement\" itemscope itemtype=\"https://schema.org/ListItem\"" + liAriaCurrent + ">");

                if (tab.DisableLink)
                {
                    breadcrumb.Append("<span class=\"" + this.cssClass + "\" itemprop=\"name\">" + tabName + "</span>");
                }
                else
                {
                    breadcrumb.Append("<a href=\"" + tabUrl + "\" class=\"" + this.cssClass + "\" itemprop=\"item\"><span itemprop=\"name\">" + tabName + "</span></a>");
                }

                breadcrumb.Append("<meta itemprop=\"position\" content=\"" + position++ + "\" />");

                if (!isLastCrumb)
                {
                    breadcrumb.Append("<span aria-hidden=\"true\">");
                    breadcrumb.Append(this.separator);
                    breadcrumb.Append("</span>");
                }

                breadcrumb.Append("</li>");
                listItemIndex++;
            }

            this.lblBreadCrumb.Text = breadcrumb.ToString();
        }

        private void ResolveSeparatorPaths()
        {
            if (string.IsNullOrEmpty(this.separator))
            {
                return;
            }

            var urlMatches = Regex.Matches(this.separator, UrlRegex, RegexOptions.IgnoreCase);
            if (urlMatches.Count > 0)
            {
                foreach (Match match in urlMatches)
                {
                    var url = match.Groups[3].Value;
                    var changed = false;

                    if (url.StartsWith("/"))
                    {
                        if (!string.IsNullOrEmpty(Globals.ApplicationPath))
                        {
                            url = string.Format("{0}{1}", Globals.ApplicationPath, url);
                            changed = true;
                        }
                    }
                    else if (url.StartsWith("~/"))
                    {
                        url = Globals.ResolveUrl(url);
                        changed = true;
                    }
                    else
                    {
                        url = string.Format("{0}{1}", this.PortalSettings.ActiveTab.SkinPath, url);
                        changed = true;
                    }

                    if (changed)
                    {
                        var newMatch = string.Format(
                            "{0}={1}{2}{3}",
                            match.Groups[1].Value,
                            match.Groups[2].Value,
                            url,
                            match.Groups[4].Value);

                        this.separator = this.separator.Replace(match.Value, newMatch);
                    }
                }
            }
        }
    }
}
