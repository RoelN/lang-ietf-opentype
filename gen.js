"use strict";

//var registry = require('language-subtag-registry/data/json/registry');

var iso639 = require('./iso639');

// Moldavian has been retired, so the shortening isn't in the official map,
// but we keep it since we still have a MOL entry
iso639["mol"] = "mo";

function buildLangsMap(v) {
    var map = new LangMap();
    for (var i = 0; i < v.length; i++) {
	var entry = v[i];
	// This will remove a DHV (drepecated) entry
	if (entry[1].indexOf("deprecated") < 0)
	    map[entry[1]] = { name: entry[0], iso: entry.slice(2) };
    }
    return map;
}

function LangMap() { }

LangMap.prototype.add = function (langSys, isoTag) {
    this.getEntryTags(langSys).push(isoTag);
    return this;
};

LangMap.prototype.removeAll = function (langSys) {
    this.getEntryTags(langSys).length = 0;
    return this;
}

LangMap.prototype.remove = function (langSys, isoTag) {
    var tags = this.getEntryTags(langSys);
    var i = tags.indexOf(isoTag);
    if (i < 0)
	throw new Error("in entry for " + langSys + " expected ISO tag " + isoTag);
    tags.splice(i, 1);
    return this;
};

LangMap.prototype.rename = function (langSys, oldIsoTag, newIsoTag) {
    var tags = this.getEntryTags(langSys);
    var i = tags.indexOf(oldIsoTag);
    if (i < 0)
	throw new Error("in entry for " + langSys + " expected ISO tag " + oldIsoTag);
    tags[i] = newIsoTag;
    return this;
};

LangMap.prototype.getEntryTags = function (langSys) {
    var entry = this[langSys];
    if (entry === undefined) 
	throw new Error('expected entry for ' + langSys);
    return entry.iso;
}

// This is before shortening

function fixupMap(m) {
    // Get rid of long mappings for ATH and QIN
    m.removeAll("ATH").removeAll("QIN");
    // Deal with out of date tags
    m.rename("HAL", "flm", "cfm"); // Falam Chin also known as Halam; flm retired
    if (false)			   // We remove all of QIN mappings above
	m.remove("QIN", "flm");
    m.rename("SIG", "xst", "stv"); // Silt'e; xst retired
    // We're keeping it, but adding a short mapping
    if (false) {
	m.remove("MOL", "mol"); // Moldavian retired
    }
    // Add some missing entries
    m.add("MOR", "ary"); // Moroccan Arabic
    m.add("BML", "bai"); // Bamileke (collection)
    m.add("BBR", "ber"); // Berber (collection)
    m.add("NOR", "nor"); // Norwegian (macrolanguage)
    m.add("ATH", "ath"); // Athapascan languages (collection)
    // Todo; prefer Kalmyk, KLM, for xal (Kalmyk); use written Oirat instead
    m.remove("TOD", "xal").add("TOD", "xwo");
    // In Ethnologue, there are about 30 Chin languages in the group
    // Sino-Tibetan/Tibeto-Burman/Sal/Kuki-Chin-Naga/Kuki-Chin
    // The most precise group for which there is a ISO639-5 code is Tibeto-Burman, thus
    m.add("QIN", "tbq"); // Tibeto-Burman languages (collection)
    // Handle cases where same ISO639 tag is mapped to multiple OT tags,
    // by removing all but one of the mappings.
    m.remove("MAL", "mal"); // Malayalam Traditional Orthography; prefer reformed orthography, MLR
    m.remove("PGR", "ell"); // Polytonic Greek; prefer Greek, ELL, for ell
    m.remove("IRT", "gle"); // Irish Traditional; prefer Irish, IRI, for gle
    m.remove("KGE", "kat"); // Khutsuri Georgian; prefer Georgia, KAT, for kat
    m.remove("BAL", "krc"); // Balkar; prefer Karachay, KAR, for Karachay-Balkar
    // Khanty
    m.remove("KHS", "kca"); // Khanty-Shurishkar; prefer Khanty-Kazim, KHK, for kca (Khanty)
    m.remove("KHV", "kca"); // Khanty-Vakhi; prefer Khanty-Kazim, KHK, for kca (Khanty)
    // Athapaskan
    m.remove("SAY", "chp"); // Sayisi; prefer Chipewyan, CHP, for chp (Chipewyan)
    m.remove("LCR", "crm"); // L-Cree; prefer Moose Cree, MCR, for crm (Moose Cree)
    m.remove("NHC", "csw"); // Norway House Cree; prefer N-Cree, NCR, for csw (Swampy Cree)
    m.remove("TCR", "cwd"); // TH-Cree; prefer Woods Cree, DCR, for cwd (Woods Cree)
    // We remove all ATH mappings above
    if (false) {
	m.remove("ATH", "chp"); // Athapaskan; prefer Chipewyan, CHP, for chp (Chipewyan)
	m.remove("ATH", "crx"); // Athapaskan; prefer Carrier, CRR, for crx (Carrier)
	m.remove("ATH", "caf"); // Athapaskan; prefer Carrier, CRR for caf (Southern Carrier)
	m.remove("ATH", "xsl"); // Athapaskan; prefer South Slavey, SSL, for xsl (South Slavey)
	m.remove("ATH", "scs"); // Athapaskan; prefer Slavey, SLA, for scs (North Slavey)
    }
    // Handle Chinese specially
    m.remove("ZHH", "zho"); // Chinese Hong Kong SAR
    m.remove("ZHP", "zho"); // Chinese Phonetic
    m.remove("ZHS", "zho"); // Chinese Simplified
    m.remove("ZHT", "zho"); // Chinese Traditional

    // Wait till we have resolved divergences from HB before adding these.
    if (false) {
	m.add("AGW", "awn").add("AGW", "ahg").add("AGW", "xan");
	m.remove("WCR", "crk").add("YCR", "crk");
	m.add("FAN", "gcf");
	m.remove("FNE", "enf");
	m.rename("KEB", "ktb", "alw");
	m.removeAll("KIS").add("KIS", "guz");
	m.rename("TNE", "enh", "yrk");
    }
    return m;
}

function shortenIso(m) {
    for (var ott in m) {
	if (m.hasOwnProperty(ott)) {
	    var v = m[ott].iso;
	    for (var i = 0; i < v.length; i++) {
		var t = iso639[v[i]];
		if (t)
		    v[i] = t;
	    }
	}
    }
    return m;
}

function invert(m) {
    var missing = "";
    var inv = {};
    for (var ott in m) {
	if (m.hasOwnProperty(ott)) {
	    var v = m[ott].iso;
	    if (v.length === 0)
		missing += " " + ott;
	    for (var i = 0; i < v.length; i++) {
		if (inv[v[i]] !== undefined)
		    console.error('duplicate for %s', v[i]);
		inv[v[i]] = ott;
	    }
	}
    }
    if (missing.length > 0)
	console.error("Missing mappings for:" + missing);
    return inv;
}

function printMap(m) {
    var tags = Object.keys(m).sort();
    for (var i = 0; i < tags.length; i++)
	console.log('%s %s', tags[i], m[tags[i]]);
}

printMap(invert(shortenIso(fixupMap(buildLangsMap(require('./otlangs'))))));
