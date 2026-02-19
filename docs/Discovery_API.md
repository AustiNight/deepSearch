Discovery API 1.0

Purpose
Our data platform hosts tens of thousands of government assets. Governments large and small publish data on crime, permits, finance, healthcare, research, performance, and more for citizens to use. While this large corpus of government data is already accessible via opendatanetwork.com, this API opens up this corpus of government data for automated searching, research, and exploration. Assets can be found by keywords, high-level categorizations, tags, and much more. This API is a powerful way to access and explore data on our platform.

The production API endpoints for this API are at

https://api.us.socrata.com/api/catalog/v1 for domains in North America
https://api.eu.socrata.com/api/catalog/v1 for all other domains
For example, to query for datasets categorized as 'Public Safety', you could use the following query:

http://api.us.socrata.com/api/catalog/v1?categories=public%20safety

Asset Visibility
There are four key factors which control whether or not an asset can be viewed anonymously by an unauthenticated user. An asset must meet criteria for all factors which apply to the domain itself (this varies domain-by-domain, as not all domains employ relevant features or modules which utilize these).

These factors are:

the asset's audience - as public vs internal or private
the asset's publication status - as published vs unpublished in a draft state
the approval status of the asset - as approved vs pending or rejected
whether the asset is hidden - as false i.e. not hidden vs true i.e. hidden
Authentication
Authentication is not required to use this API for read-only access to the corpus of anonymously-viewable (i.e. public, published, approved, and not hidden) assets. However, if you wish to search for private, unpublished, unapproved or hidden data, you must authenticate yourself and ensure that you have adequate permissions to view the data in question.

To authenticate, you must:

Use one of the methods discussed here and
Provide the 'X-Socrata-Host' host header with the domain that has granted you access to view its assets. For example 'X-Socrata-Host:data.ny.gov'.
When properly authenticated, you will be able to search over:

All data that is anonymously-viewable.
Any data that you own or that has been shared to you.
Private, unpublished, unapproved, and hidden assets from domains that have granted you a right to view such assets.
App Tokens
All programmatic usage of Socrata APIs should include an app token, either via the X-App-Token header or the $$app_token parameters set to a valid token. This is assumed and not documented in the API specs below.

Additional API facts
Search without any parameters returns the set of data you are authorized to see. Any parameter usage serves to filter (or sort) this set of data - i.e. no parameters allow you to see more data than a search without parameters. This is important to know when considering parameters that let you search for assets not found in the public catalog. If you are unauthorized to see such things, your results will be empty.

Multiple repetitive parameters are treated differently from multiple unique parameters. Unique parameters, for example

?tags=fire&provenance=official

filters to the intersection of the values. In this example, the search is for official assets with the tag 'fire'. Repetitive parameters filter to the union of values. For example

?tags=fire&tags=commission

searches for assets tagged as either 'fire' or 'commission'. The combination of both repetitive and unique parameters follow the same rules. Thus the query

?tags=fire&tags=commission&provenance=official

would search for official assets tagged as either 'fire' or 'commission'.

Many parameters support repetitive usage, using either the syntax above or the alternate syntax using brackets, e.g. ?tags[]=fire&tags[]=commission. Parameter descriptions will tell whether this is supported or not.

Because this API supports custom metadata search and because custom metadata keys are arbitrary, any unrecognized params are assumed to be custom metadata. Thus, if you misname a parameter, for example ?domain=data.ny.gov (the parameter should be 'domains'), the results will be empty unless there are assets with the custom metadata key 'domain' and value 'data.ny.gov'.

Find assets by id
get /catalog/v1?ids={4x4}
Most assets are uniquely identified by a string known as a four-by-four. This is a string made from eight alphanumeric characters split into two four-character phrases, e.g. ku42-jx2v. While most assets follow this pattern, their drafts do not. Draft IDs join the four-by-four of the published version with a colon and a draft identifier. For stories, which only ever support a single shared draft, the draft's identifier is "draft". For example, if a draft of story ku42-jx2v is created, its ID would be ku42-jx2v:draft. For non-story drafts, the draft's identifier is an integer. For example, if the 7th draft of asset cio5-yr56 is created, its ID would be cio5-yr56:7. The ids parameter will limit the results to the assets identified in this way.

Examples
?ids=ku42-jx2v
?ids=ku42-jx2v&ids=ku42-jx2v:draft
?ids=cio5-yr56,cio5-yr56:7
REQUEST
QUERY-STRING PARAMETERS
ids
string
The four-by-four identifier of an asset. A comma-separated list of IDs is supported. Repeated params are supported.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find assets by domain
get /catalog/v1?search_context={domain}&domains={domain}
Each asset is owned by a single domain. The domains and search_context parameters are used to limit the results to the inferred domains. If neither of the domains or search_context are provided, the inferred domains are all domains. Please note, that because of the size of this set, the user will not be authenticated across all of the domains and the user will effectively be treated as an anonymous user. If only a search_context is provided, the inferred domains will include the search_context and any domains which federate data into the search_context. Using this parameter allows you to see the returned data "through the eyes" of a given domain, e.g. filter and search across their tags/categories/custom metadata. If domains are provided, there is no need to infer domains and the given domains will be searched.

Examples
?search_context=data.ny.gov
?domains=data.ny.gov
?domains=data.ny.gov,data.cityofchicago.org
?search_context=data.ny.gov&domains=data.ny.gov,data.cityofchicago.org
REQUEST
QUERY-STRING PARAMETERS
search_context
string
A domain name that represents the named domain and all incoming federations. Required with category and tag search.


domains
string
The domain name from which an asset comes. A comma-separated list of names is supported. Repeated params are supported.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find assets by name
get /catalog/v1?names={name}
Every asset is given a name/title. The names parameter will limit results to those having the given name. This filter is case insensitive, but otherwise operates like an exact match. If the exact name is not known, consider using the q parameter to search by query or to autocomplete the name. Keep in mind that spaces and other special characters should be url-encoded.

Examples
?names=NYS%20Attorney%20Registrations
?names=nys%20attorney%20registrations&names=OpenNY%20Press%20Releases
?names[]=NYS%20Attorney%20Registrations &names[]=OpenNY%20Press%20Releases
REQUEST
QUERY-STRING PARAMETERS
names
string
The title of an asset. Repeated params, with or without brackets, are supported.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find assets by category
get /catalog/v1?search_context={search_context}&categories={category}
Each domain is allowed to customize the categories they use and each asset may be assigned one of these categories or none. The categories parameter will limit the results to those having the given category, but only if the search_context is included.

Examples
?search_context=data.ny.gov&categories=Recreation
?search_context=data.ny.gov&categories=Recreation&categories=Education
?search_context=data.ny.gov &categories[]=Recreation&categories[]=Education
REQUEST
QUERY-STRING PARAMETERS
search_context
string
A domain name that represents the named domain and all incoming federations. Required with category and tag search.


categories
string
The category of an asset. Repeated params, with or without brackets, are supported.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find assets by tag
get /catalog/v1?search_context={search_context}&tags={tag}
Each asset may have none, one or more tags associated with it. The tags parameters will limit the results to those having the given tag, but only if the search_context is included.

Examples
?search_context=data.ny.gov&tags=%23environment
?search_context=data.ny.gov&tags=%23environment&tags=2017
?search_context=data.ny.gov&tags[]=2018&tags[]=2017
REQUEST
QUERY-STRING PARAMETERS
search_context
string
A domain name that represents the named domain and all incoming federations. Required with category and tag search.


tags
string
Any of the tags on an asset. Repeated params, with or without brackets, are supported.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find assets by type
get /catalog/v1?only={type}
Each asset has a logical type, such as a dataset or chart. The only parameter will limit the results to a particular type. The current taxonomy includes the following types: api, calendar, chart, dataset, federated_href, file, filter, form, href, link, map, measure, story, visualization You may use either the singular or plural variants of each type.

Examples
?only=charts
?only=charts,maps
?only=datasets&only=link
?only[]=story&only[]=measure
REQUEST
QUERY-STRING PARAMETERS
only
string enum
The datatype of an asset. Singular or plural terms are accepted. A comma-separated list of types is supported. Repeated params, with or without brackets, are supported.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find by domain-specific metadata
get /catalog/v1?{custom_metadata_key}={value}
Each domain has the ability to add custom metadata to datasets beyond the default metadata. This custom metadata is different for every domain, but within a domain, all assets may be labeled with the metadata. The custom metadata is a named set of key-value pairs. For example one domain might have a set named 'Dataset Information' which has keys 'Localities' and 'Agencies & Authorities', while another domain has a set named 'Dataset Category' having key 'Agency'). The caller may restrict the results to a particular custom metadata pair by specifying the parameter name as a combination of the set's name and the key's name and the parameter value as the key's value. To construct the parameter name, join the set's name to the key's name with an underscore and replace all spaces with dashes. Some examples are given in the table below:

Set Name	Field Name	Parameter
Dataset Information	Localities	?Dataset-Information_Localities
Data Summary	Units	?Dataset-Summary_Units
Información de la Entidad	Nombre de la Entidad	?Información-de-la-Entidad_Nombre-de-la-Entidad
Examples
?Dataset-Information_Localities=Albany%2C+City+of
?Dataset-Information_Localities=Albany%2C+City+of&Dataset-Summary_Units=Permits
?Dataset-Category_Agency=Office+of+the+Governor
REQUEST
QUERY-STRING PARAMETERS
custom-metadata_key
string
The name 'custom-metadata_key' is meant to represent any custom metadata field-set and field. See Find by domain-specific metadata for more details.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find assets by attribution
get /catalog/v1?attribution={organization}
Assets can be attributed to various organizations. The attribution parameter will limit the results to those attributed to the given organization.

Examples
?attribution=New%20York%20State%20Gaming%20Commission
?attribution=Texas%20Comptroller%20of%20Public%20Accounts
REQUEST
QUERY-STRING PARAMETERS
attribution
string
The case-sensitive name of the attributing entity.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find assets by license
get /catalog/v1?license={license}
Assets can be released under various licenses. The license parameter will limit the results to those with the given license.

Examples
?license=Public%20Domain
?license= Creative%20Commons%201.0%20Universal%20(Public%20Domain%20Dedication)
REQUEST
QUERY-STRING PARAMETERS
license
string
The case-sensitive license name.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find assets by query term
get /catalog/v1?q={query}&min_should_match={match_term}
Assets may be searched by any of the text found in the name, description, category, tags, column names, column fieldnames, column descriptions, attribution fields. The q parameter takes arbitrary text and will limit the results to those having some or all of the text. The optional min_should_match parameter may be used to explicitly specify the number or percent of words that must match. See the Elasticsearch docs for the format of arguments to min_should_match. If min_should_match is not specified, the service's default is '3<60%', meaning that if there are 3 or fewer search terms specified, all of them must match; otherwise 60% of the search terms must be found in the fields specified above. For example, if min_should_match is '3<60%', searching for

'city dog park' will require stemmed matches for all three words; thus, 'Western Cities Association Dog Parks' will match, but 'New York City Parks' will not.
'trees green spaces new york' will require 60% of the words to match, which is 3 out of 5 words. Thus, 'New York Tree Map', and 'New Green Spaces Initiative' will both match.
Examples
?q=result
?q=school%20result%20SAT
?q=school%20result%20SAT&min_should_match=-1
REQUEST
QUERY-STRING PARAMETERS
q
string
For search, a token matching one from an asset's name, description, category, tags, column names, column fieldnames, column descriptions or attribution.

For autocomplete, a token matching either an asset's name or tags.


min_should_match
string
The number or percent of words that must match. Acceptable formats are defined here.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find assets by parent id
get /catalog/v1?parent_ids={4x4}
Some assets are uploaded directly and others are created from already existing data. For example, charts are derived from an existing parent dataset. The parent_ids parameter will limit the results to those having the parent dataset ids given.

Examples
?parent_ids=nqur-w4p7
?parent_ids=nqur-w4p7&parent_ids=qzve-kjga
?parent_ids=nqur-w4p7,qzve-kjga
REQUEST
QUERY-STRING PARAMETERS
parent_ids
string
The four-by-four identifier of a parent asset having child assets. A comma-separated list of IDs is supported. Repeated params are supported.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find assets derived from others
get /catalog/v1?derived_from={4x4}
Some assets are uploaded directly and others are created from or use other data. For example, charts are derived from an existing parent dataset and stories may then incorporate those charts. Measures may also incorporate one or more datasets. The derived_from parameter will limit the results to those that derive from the given dataset.

Examples
?derived_from=8f6m-78bg
REQUEST
QUERY-STRING PARAMETERS
derived_from
string
The four-by-four identifier of an asset from which other assets are derived.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find by provenance
get /catalog/v1?provenance={provenance}
While many assets on our platform are owned by government data publishers and other staff, some visualizations, maps, filtered views, and more are created by a member of the community. These assets are usually denoted with a 'Community' badge on the data catalog. A provenance=official parameter will limit the results to official assets, i.e. those owned by roled users on the domain. A provenance=community parameter will limit the results to community created assets.

Examples
?provenance=official
?provenance=community
REQUEST
QUERY-STRING PARAMETERS
provenance
string enum
The provenance of an asset.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find by owner
get /catalog/v1?for_user={4x4}
Each asset has an owner, which may be a user or a team. The for_user parameter will limit the results to those owned by the user or team having the provided four-by-four identifier.

Examples
?for_user=xzik-pf59
?for_user=xzik-pf59,fpiq-yg3w
?for_user=xzik-pf59&for_user=fpiq-yg3w
REQUEST
QUERY-STRING PARAMETERS
for_user
string
The four-by-four identifier of a user who owns data. A comma-separated list of IDs is supported. Repeated params are supported.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find by granted shares
get /catalog/v1?search_context={domain}&shared_to={4x4}
Each asset may be shared to teams or individual users. The shared_to param allows you to specify four-by-four identifier of a user or team and the results will be limited to those which were shared to them. Please note:

If you are not an administrator, you may only specify yourself as the user to whom assets are shared.
If you are not an administrator, you may only specify teams that you are on (as a member or an owner) as the teams to which assets are shared.
If you are an administrator, you may see what's shared to any user or team on the domain where you are an administrator.
You must include the domain name with the search_context parameter.
If you search for assets shared to you, with or without assets shared to your teams, assets owned by you will be filtered out. You must authenticate in order to see any assets when using this param.

Examples
?search_context=data.ny.gov&shared_to=xzik-pf59
?search_context=data.ny.gov&shared_to=8xiq-st2k,xzik-pf59
?search_context=data.ny.gov&shared_to=8xiq-st2k&shared_to=xzik-pf59
REQUEST
QUERY-STRING PARAMETERS
shared_to
string
The four-by-four identifier of a user who is shared data. A comma-separated list of IDs is supported. Repeated params are supported.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find by column name
get /catalog/v1?column_names={name}
Tabular assets are composed of rows and columns. The column_names parameter will limit the results to those having the given column names. The search is case insensitive, but otherwise looks for an exact match. Keep in mind that spaces and other special characters should be url-encoded.

Examples
?column_names=Winning%20numbers
?column_names=Winning%20numbers&column_names=Draw%20Date
?column_names[]=winning%20NUMBERS&column_names[]=draw%20date
REQUEST
QUERY-STRING PARAMETERS
column_names
string
The name of a column within a dataset. Repeated params, with or without brackets, are supported.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find by visibility
get /catalog/v1?visibility={visibility}&show_visibility={true|false}
While many assets on our platform are discoverable and accessible via the open data catalog, others are held internally for government use. A visibility=open parameter will limit the results to only those that would show in the public catalog. A visibility=internal parameter will limit the results to those held internally, but note that only authenticated users who have sufficient rights and provide either a search_context or domains parameter will receive results. As discussed in the "Asset Visibility" at the beginning of this documentation, this visibility status is a product of four factors. This parameter is thus a convenience parameter where a 'open' value corresponds to

audience=public&published=true&approval_status=approved&explicitly_hidden=false.

By default, visibility information is not included on the returned assets. To have it returned, attach a show_visibility=true parameter.

Examples
?visibility=open
?visibility=open&show_visibility=true
?search_context=data.texas.gov&visibility=internal
REQUEST
QUERY-STRING PARAMETERS
visibility
string enum
The visibility of an asset.


show_visibility
boolean
Whether to include visibility information in the response.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find by audience
get /catalog/v1?audience={audience}
The audience is the first of four factors which control an asset’s visibility. Each asset has one of three different audiences. These include:

private if the asset is only visible to the owner and any individuals the owner has shared the asset to
site if the asset is visible to all members of a site/domain
public if the asset is visible to anyone, within or outside the site/domain
Only the audience=public parameter may be used by any user. The audience=site and audience=private parameters are only available to authenticated users who have sufficient rights and provide either a search_context or domains parameter, else a 401 error is returned.

Examples
?audience=public
?search_context=data.texas.gov&audience=site
?domains=data.texas.gov&audience=private
REQUEST
QUERY-STRING PARAMETERS
audience
string enum
The audience of an asset.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find by publication status
get /catalog/v1?published={true|false}
The publication status of each asset is the second of four factors which control an asset’s visibility. A published=true parameter will limit the results to those that are published; A published=false parameter will limit the results to those that are unpublished, but note that only authenticated users who have sufficient rights and provide a search_context or domains parameter will receive results.

Examples
?published=true
?search_context=data.texas.gov&published=false
REQUEST
QUERY-STRING PARAMETERS
published
boolean
Whether the asset is published or not.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find hidden/unhidden assets
get /catalog/v1?explicitly_hidden={true|false}
The hidden status of each asset is the third of four factors which control an asset’s visibility. Some sites selectively and explicitly hide certain assets from their public catalog for different reasons. A explicitly_hidden=false parameter will limit the results to those that are not hidden. A explicitly_hidden=true parameter will limit the results to those that are hidden, but note that only authenticated users who have sufficient rights and provide a search_context or domains parameter will receive results.

Examples
?explicitly_hidden=false
?search_context=data.texas.gov&explicitly_hidden=true
REQUEST
QUERY-STRING PARAMETERS
explicitly_hidden
boolean
Whether the asset is hidden from the public catalog or not.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find by approval status
get /catalog/v1?approval_status={approved|rejected|pending|not_ready}&target_audience={public|internal}
The approval status of each asset is the fourth of four factors which control an asset’s visibility. Assets must be approved in order to become anonymously or internally viewable. At any point in time, the status of these views may be 'pending', 'rejected', 'approved' or 'not_ready' (to be approved) for either of the public or internal audiences. The approval_status parameter accepts one of those values and will limit the results to those assets with the given state. The target_audience parameter accepts either 'public' or 'internal' and further limits the results to those with the given approvals status destined for the given target audience. Note that no results will be returned when searching for rejected, pending or not_ready approval statuses unless the data is already anonymously viewable or the user has authenticated and provided a search_context or domains parameter.

Examples
?approval_status=approved
?approval_status=approved&target_audience=public
?domains=data.ny.gov&approval_status=rejected,pending
?domains=data.ny.gov&approval_status=rejected&approval_status=approved
?domains=data.ny.gov&approval_status[]=rejected &approval_status[]=approved
?search_context=datahub.hhs.gov&approval_status=not_ready &target_audience=internal
?search_context=datahub.hhs.gov&approval_status=approved &target_audience[]=public&target_audience[]=internal
REQUEST
QUERY-STRING PARAMETERS
approval_status
string enum
The internal or public approval status of an asset. Combine with a target_audience=public or target_audience=internal parameter to limit to the approval status of public-bound or internal-bound data. A comma-separated list of statuses is supported. Repeated params, with or without brackets, are supported.


target_audience
string enum
The audience a submitted asset desires if approved. Combine with the approval_status parameter to limit to particular stages of the approval process. A comma-separated list of statuses is supported. Repeated params, with or without brackets, are supported.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find by submitter
get /catalog/v1?submitter_id={4x4}
For assets that have been submitted for approval and are currently pending, rejected or approved, the 'submitter_id' parameter accepts the submitting user's four-by-four identifier and will limit the results to those assets which have been submitted by that user.

Examples
?submitter_id=xzik-pf59
REQUEST
QUERY-STRING PARAMETERS
submitter_id
string
The four-by-four identifier of a user who has submitted an asset for approval.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find by reviewer
get /catalog/v1?reviewer_id={4x4}
For assets that have been submitted for approval and reviewed, and are currently rejected or approved, the 'reviewer_id' parameter accepts the reviewing user's four-by-four identifier and will limit the results to those assets which have been reviewed by that user.

Examples
?reviewer_id=r4qn-dwdd
REQUEST
QUERY-STRING PARAMETERS
reviewer_id
string
The four-by-four identifier of a user who has submitted an asset for approval.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Find derived/base assets
get /catalog/v1?derived={true|false}
Some assets are uploaded directly and others are created from already existing data. For example, charts are derived from an existing parent dataset. The derived parameter will limit the results to one or other of these classes of data. A 'true' value finds derived assets and a 'false' value finds base assets.

Examples
?derived=true
?derived=false
REQUEST
QUERY-STRING PARAMETERS
derived
boolean
Whether the asset was derived from another or uploaded directly.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Sort results
get /catalog/v1?order={sort_order}
The results of all the above filters can be sorted by any of the attributes in the list below. If not specified, the results are sorted by relevance. All sort values can optionally append a space and either 'ASC' or 'DESC' for ascending or descending sorts, but note that the space must be URL-escaped with '+' or '%20'. The default for each attribute is given in the table. It is possible for search results to have missing values for some of these sort fields (such as 'domain_category', for example). Any assets missing a value altogether for the field being sorted on will show up at the end of the results list.

Attribute	Default Sort Order
relevance (default)	descending
name	ascending
owner	ascending
dataset_id	ascending
datatype	ascending
domain_category	ascending
createdAt	descending
updatedAt	descending
page_views_total	descending
page_views_last_month	descending
page_views_last_week	descending
Examples
?order=name
?order=dataset_id%20ASC
order=page_views_total+DESC
REQUEST
QUERY-STRING PARAMETERS
order
string enum
The field to sort assets by. Optionally append a space and 'ASC' or 'DESC' to direct the sort.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Paginate results
get /catalog/v1?limit={number}&offset={number}
The search service allows pagination of results. By default, we will return at most 100 results starting from 0. Using the limit and offset params will return at most {limit} results starting from {offset}.

If the sum of the offset and limit parameters is greater than 10000, the server will respond with a 400. If your use-case involves scanning over a large set of results, you will want to use the scroll_id parameter in conjunction with the limit parameter. For more detail, refer to Deep scrolling results.

Examples
?limit=10&offset=0
?limit=10&offset=10
?limit=10&offset=20
REQUEST
QUERY-STRING PARAMETERS
limit
number
The max number of results to return.


Constraints: Range: [0,10000]
offset
number
The starting point for paging.


Constraints: Range: [0,10000]
RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Deep scroll results
get /catalog/v1?limit={number}&scroll_id={id}
The search API is optimized for the prototypical use-case -- namely, providing some queries or filter conditions, and retrieving a relatively small number of search results. As a result, the search service does not support paging over a large set of search results. Specifically, if the sum of the offset and limit parameters is greater than 10000, the server will respond with a 400. This will happen regardless of the actual result set size. Larger result sets can be incrementally paged over via the scroll_id parameter.

This parameter takes a value corresponding to an asset ID, specifically, the ID of the last result in the previously fetched chunk of results. So for example, suppose you execute a query and find that it returns a large set of results (ie. more than 10000). You should execute the same query again, including a reasonable value for the limit parameter, being sure to include the scroll_id parameter as well. Initially, you won't have a value for the scroll_id parameter, so you will leave it blank. But with each subsequent request, you should pass the asset id corresponding to the last result from the previously fetched batch of results.

Note that sorting parameters are not honored when used in conjunction with deep scrolling via the scroll_id parameter. If the order or offset parameters are specified at the same time as the scroll_id parameter, the server will respond with a 400.

Examples
?limit=100&scroll_id
?limit=100&scroll_id=6rrk-xbdr
REQUEST
QUERY-STRING PARAMETERS
limit
number
The max number of results to return.


Constraints: Range: [0,10000]
scroll_id
string
Initially empty, but afterwards, the four-by-four identifier of the final asset in the current results.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Boost assets
get /catalog/v1?boost{key}={number}
It is possible to adjust the rankings of assets to promote them above others. This leverages the weight function of function score queries. This weight acts as a multiplier for the relevance score of each document. Thus, a number between 0 and 1 will demote assets, while any number greater than 1 will boost them.

Several parameters allow for different types of boosting. Some notes about the table below:

The Explanation assumes a greater than 1 value
Where you see {variable_name} in the Parameter, that requires substituting in a value. See the examples below.
The boost params boostTitle, boostDesc and boostColumns work in conjunction with the q param
Parameter	Explanation
boostOfficial	Official assets boosted; community assets not
boost{Datatype}	Assets having the given {Datatype} boosted; others not
boostDomains[{DomainName}]	Assets from the given {DomainName} boosted; others not
boostTitle	Assets with titles matching the 'q' query boosted; others not
boostDesc	Assets with descriptions matching the 'q' query boosted; others not
boostColumns	Assets with column names matching the 'q' query boosted; others not
Examples
?boostOfficial=3.6
?boostStories=2&boostMaps=3
?boostDomains[data.ny.gov]=2
?boostTitle=2&q=Lotto
?boostDesc=1.5&q=hospitalizations
?boostColumns=5.67&q=vendor
REQUEST
QUERY-STRING PARAMETERS
boostOfficial
number
Multiplier for the relevance score of official assets.


boost{Datatype}
number
Multiplier for the relevance score of assets with the given {Datatype}. A parameter name for example is boostStories or boostMaps.


boostDomains[{DomainName}]
number
Multiplier for the relevance score of assets from the given {DomainName}. A parameter name for example is boostDomains[data.ny.gov] or boostDomains[data.texas.gov].


boostTitle
number
Multiplier for the relevance score of assets having a title that matches the given query. Use with the q parameter to define the query.


boostDesc
number
Multiplier for the relevance score of assets having a description that matches the given query. Use with the q parameter to define the query.


boostDesc
number
Multiplier for the relevance score of assets having column names that matches the given query. Use with the q parameter to define the query.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Search Response - The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Autocomplete asset names
get /catalog/v1/autocomplete?q={query}&deduplicate={true|false}
The Discovery API supports autocomplete of asset names and tags. Using the autocomplete endpoint for asset names returns assets having titles that match the search query. Any of the filtering parameters described above may be used with the required q parameter. Note that while this endpoint mirrors the top-level search endpoint, the behavior of the q parameter differs slightly. Just as with the full search endpoint, it takes arbitrary text. However, the autocomplete search is restricted to the 'name' field of the asset (i.e. the asset title). Additionally, this autocomplete search can return different assets than the top-level search. An simplified explanation is that the former matches characters while the latter matches words.

An additional and optional parameter, deduplicate, provides two different behaviors. If 'true', no asset title will appear more than once. If 'false', every matching asset is returned along with its four-by-four identifier.

Examples
?q=medi
?q=medi&deduplicate=true
?q=medi&deduplicate=false
REQUEST
QUERY-STRING PARAMETERS
q
string
For search, a token matching one from an asset's name, description, category, tags, column names, column fieldnames, column descriptions or attribution.

For autocomplete, a token matching either an asset's name or tags.


deduplicate
boolean
Whether the results returned from autocomplete return distinct titles or not. When 'false', asset ids are returned in addition to the typical response.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Autocomplete Titles Response - The response from a query to api/catalog/v1/autocomplete.

Field
Type
Description
[TitleMatch]
An array of the autocomplete matches from a query.

title
string
The raw title of the matching asset.


Example: Medicaid Enrolled Provider Listing
display_title
string
An html marked up variant of the raw title that provides highlighting.


Example: <span class=highlight>Medi</span>caid Enrolled Provider Listing
id
string
The four-by-four identifier of the matching asset; only present when using the deduplicate=false param.


Example: keti-qx5t
[array of array]
An array of indices defining the location of the match.

MatchOffsets
An array of indices defining the location of the match.

start
number
Where the matched query term starts, as a character count, in the associated asset field.


length
number
The number of characters the matched query term has.


Example: 4
resultSetSize
number
The total number of matches that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Autocomplete asset tags
get /catalog/v1/tags/autocomplete?q={query}
The Discovery API supports autocomplete of asset names and tags. Using the autocomplete endpoint for tags returns assets having tags that match the search query. Any of the filtering parameters described above may be used with the required q parameter. Note that while this endpoint mirrors the top-level search endpoint, the behavior of the q parameter differs slightly. Just as with the full search endpoint, it takes arbitrary text. However, the autocomplete search is restricted to the 'tags' field of the asset.

Examples
?q=medi
REQUEST
QUERY-STRING PARAMETERS
q
string
For search, a token matching one from an asset's name, description, category, tags, column names, column fieldnames, column descriptions or attribution.

For autocomplete, a token matching either an asset's name or tags.


RESPONSE
MODEL
EXAMPLE
application/json
200 - Autocomplete Tags Response - The response from a query to api/catalog/v1/tags/autocomplete.

Field
Type
Description
[TagMatch]
An array of the autocomplete matches from a query.

tag_text
string
The tag of the matching asset.


Example: medicare
[array of array]
An array of indices defining the location of the match.

MatchOffsets
An array of indices defining the location of the match.

start
number
Where the matched query term starts, as a character count, in the associated asset field.


length
number
The number of characters the matched query term has.


Example: 4
resultSetSize
number
The total number of matches that could be returned from a query.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Count assets by domain
get /catalog/v1/domains
This endpoint mirrors the top-level endpoint, accepting any of the filtering params described above. It returns the count of assets matching the query grouped by domain. Providing no parameters returns the count of assets the user is able to view, subject to authentication, grouped by domain.

Examples
?
?audience=public&q=dog
?only=maps
REQUEST
RESPONSE
MODEL
EXAMPLE
application/json
200 - Count by Domain Response - The response from a query to api/catalog/v1/domains.

Field
Type
Description
[DomainAndCount]
An array of domains and counts.

domain
string
The domain's name.


Example: data.ny.gov
count
integer
The count of assets from the named domain.


Example: 1488
resultSetSize
number
The total number of domains returned.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Count assets by tag
get /catalog/v1/domain_tags
This endpoint mirrors the top-level endpoint, accepting any of the filtering params described above. It returns the count of assets matching the query grouped by tag. Providing no parameters returns the count of assets the user is able to view, subject to authentication, grouped by tag.

Examples
?
?domains=data.texas.gov
?only=datasets&q=popul
REQUEST
RESPONSE
MODEL
EXAMPLE
application/json
200 - Count by Tag Response - The response from a query to api/catalog/v1/domain_tags.

Field
Type
Description
[TagAndCount]
An array of tags and counts.

domain_tag
string
The tag.


Example: oceans
count
integer
The count of assets having the tag.


Example: 12076
resultSetSize
number
The total number of tags returned.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Count assets by category
get /catalog/v1/domain_categories
This endpoint mirrors the top-level endpoint, accepting any of the filtering params described above. It returns the count of assets matching the query grouped by category. Providing no parameters returns the count of assets the user is able to view, subject to authentication, grouped by category.

Examples
?
?domains=data.ny.gov
?provenance=official
REQUEST
RESPONSE
MODEL
EXAMPLE
application/json
200 - Count by Category Response - The response from a query to api/catalog/v1/domain_categories.

Field
Type
Description
[CategoryAndCount]
An array of categories and counts.

domain_category
string
The category.


Example: Health
count
integer
The count of assets having the category.


Example: 3590
resultSetSize
number
The total number of categories returned.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8


Count assets by facets
get /catalog/v1/domains/{domain}/facets
This endpoint mirrors the top-level endpoint, accepting any of the filtering params described above. It returns the count of assets matching the query grouped by the following facets:

datatypes
categories
tags
provenance
custom metadata
Providing no parameters returns the count of assets the user is able to view, subject to authentication, grouped by each facet.

Examples
?
?only=stories
REQUEST
RESPONSE
MODEL
EXAMPLE
application/json
200 - Count by Facets Response - The response from a query to api/catalog/v1/domains/{domainName}/facets.

Field
Type
Description
facet
string
The facet class.


Example: datatypes
count
integer
The count of assets in the facet class.


Example: 806
[ValueAndCount]
The facet value and the count of assets having that value.

value
string
The facet value.


Example: dataset
count
integer
The count of assets having the value for that facet.


Example: 806


Parameters
Describes operation parameters. A unique parameter is defined by a combination of a name and location.

approval_status
Field
Type
Description
string enum
The internal or public approval status of an asset. Combine with a target_audience=public or target_audience=internal parameter to limit to the approval status of public-bound or internal-bound data. A comma-separated list of statuses is supported. Repeated params, with or without brackets, are supported.


Allowed: approved ┃ pending ┃ rejected ┃ not_ready
attribution
Field
Type
Description
string
The case-sensitive name of the attributing entity.


Example: New%20York%20State%20Gaming%20Commission
audience
Field
Type
Description
string enum
The audience of an asset.


Allowed: public ┃ site ┃ private
boostColumns
Field
Type
Description
number
Multiplier for the relevance score of assets having column names that matches the given query. Use with the q parameter to define the query.


Example: 8
boostDatatype
Field
Type
Description
number
Multiplier for the relevance score of assets with the given {Datatype}. A parameter name for example is boostStories or boostMaps.


Example: 3
boostDesc
Field
Type
Description
number
Multiplier for the relevance score of assets having a description that matches the given query. Use with the q parameter to define the query.


Example: -2
boostDomain
Field
Type
Description
number
Multiplier for the relevance score of assets from the given {DomainName}. A parameter name for example is boostDomains[data.ny.gov] or boostDomains[data.texas.gov].


Example: 0.5
boostOfficial
Field
Type
Description
number
Multiplier for the relevance score of official assets.


Example: 2.3
boostTitle
Field
Type
Description
number
Multiplier for the relevance score of assets having a title that matches the given query. Use with the q parameter to define the query.


Example: 1.2
categories
Field
Type
Description
string
The category of an asset. Repeated params, with or without brackets, are supported.


Example: Recreation
column_names
Field
Type
Description
string
The name of a column within a dataset. Repeated params, with or without brackets, are supported.


Example: winning+numbers
custom-metadata_key
Field
Type
Description
string
The name 'custom-metadata_key' is meant to represent any custom metadata field-set and field. See Find by domain-specific metadata for more details.


Example: Albany%2C+City+of
deduplicate
Field
Type
Description
boolean
Whether the results returned from autocomplete return distinct titles or not. When 'false', asset ids are returned in addition to the typical response.


Allowed: true ┃ false
derived
Field
Type
Description
boolean
Whether the asset was derived from another or uploaded directly.


Allowed: true ┃ false
derived_from
Field
Type
Description
string
The four-by-four identifier of an asset from which other assets are derived.


Example: 8f6m-78bg
domains
Field
Type
Description
string
The domain name from which an asset comes. A comma-separated list of names is supported. Repeated params are supported.


Example: data.ny.gov
explicitly_hidden
Field
Type
Description
boolean
Whether the asset is hidden from the public catalog or not.


Allowed: true ┃ false
for_user
Field
Type
Description
string
The four-by-four identifier of a user who owns data. A comma-separated list of IDs is supported. Repeated params are supported.


Example: xzik-pf59
ids
Field
Type
Description
string
The four-by-four identifier of an asset. A comma-separated list of IDs is supported. Repeated params are supported.


Example: ku42-jx2v
license
Field
Type
Description
string
The case-sensitive license name.


Example: Public+Domain
limit
Field
Type
Description
number
The max number of results to return.


Constraints: Range: [0,10000]
Default: 100
Example: 10
min_should_match
Field
Type
Description
string
The number or percent of words that must match. Acceptable formats are defined here.


Example: -1
names
Field
Type
Description
string
The title of an asset. Repeated params, with or without brackets, are supported.


Example: NYS+Attorney+Registrations
offset
Field
Type
Description
number
The starting point for paging.


Constraints: Range: [0,10000]
Default: 0
Example: 10
only
Field
Type
Description
string enum
The datatype of an asset. Singular or plural terms are accepted. A comma-separated list of types is supported. Repeated params, with or without brackets, are supported.


Allowed: chart ┃ dataset ┃ file ┃ filter ┃ link ┃ map ┃ measure ┃ story ┃ system_dataset ┃ visualization
order
Field
Type
Description
string enum
The field to sort assets by. Optionally append a space and 'ASC' or 'DESC' to direct the sort.


Default: relevance
Allowed: relevance ┃ name ┃ owner ┃ dataset_id ┃ datatype ┃ domain_category ┃ createdAt ┃ updatedAt ┃ page_views_total ┃ page_views_last_month ┃ page_views_last_week
parent_ids
Field
Type
Description
string
The four-by-four identifier of a parent asset having child assets. A comma-separated list of IDs is supported. Repeated params are supported.


Example: ku42-jx2v
provenance
Field
Type
Description
string enum
The provenance of an asset.


Allowed: official ┃ community
published
Field
Type
Description
boolean
Whether the asset is published or not.


Allowed: true ┃ false
q
Field
Type
Description
string
For search, a token matching one from an asset's name, description, category, tags, column names, column fieldnames, column descriptions or attribution.

For autocomplete, a token matching either an asset's name or tags.


Example: pop
reviewer_id
Field
Type
Description
string
The four-by-four identifier of a user who has submitted an asset for approval.


Example: ku42-jx2v
scroll_id
Field
Type
Description
string
Initially empty, but afterwards, the four-by-four identifier of the final asset in the current results.


Example: 6rrk-xbdr
search_context
Field
Type
Description
string
A domain name that represents the named domain and all incoming federations. Required with category and tag search.


Example: data.ny.gov
shared_to
Field
Type
Description
string
The four-by-four identifier of a user who is shared data. A comma-separated list of IDs is supported. Repeated params are supported.


Example: xzik-pf59
show_visibility
Field
Type
Description
boolean
Whether to include visibility information in the response.


Allowed: true ┃ false
submitter_id
Field
Type
Description
string
The four-by-four identifier of a user who has submitted an asset for approval.


Example: ku42-jx2v
tags
Field
Type
Description
string
Any of the tags on an asset. Repeated params, with or without brackets, are supported.


Example: Environment
target_audience
Field
Type
Description
string enum
The audience a submitted asset desires if approved. Combine with the approval_status parameter to limit to particular stages of the approval process. A comma-separated list of statuses is supported. Repeated params, with or without brackets, are supported.


Allowed: public ┃ internal
visibility
Field
Type
Description
string enum
The visibility of an asset.


Allowed: open ┃ internal
Schemas
Approval
Approval information for the asset relative to the given target_audience

Field
Type
Description
state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
Asset
The representation of an asset.

Field
Type
Description
Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
CategoryAndCount
The category and the count of matching assets.

Field
Type
Description
domain_category
string
The category.


Example: Health
count
integer
The count of assets having the category.


Example: 3590
Classification
Category, tags and custom metadata for the asset.

Field
Type
Description
categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Creator
User data about the user who created the asset.

Field
Type
Description
id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
DomainAndCount
The domain and the count of matching assets.

Field
Type
Description
domain
string
The domain's name.


Example: data.ny.gov
count
integer
The count of assets from the named domain.


Example: 1488
FacetAndCount
The facet and the count of assets having that facet.

Field
Type
Description
facet
string
The facet class.


Example: datatypes
count
integer
The count of assets in the facet class.


Example: 806
[ValueAndCount]
The facet value and the count of assets having that value.

value
string
The facet value.


Example: dataset
count
integer
The count of assets having the value for that facet.


Example: 806
MatchOffsets
The location of the match.

Field
Type
Description
start
number
Where the matched query term starts, as a character count, in the associated asset field.


length
number
The number of characters the matched query term has.


Example: 4
Metadata
Secondary metadata about the asset.

Field
Type
Description
domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

Field
Type
Description
id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Page Views
The set of page view data for the asset.

Field
Type
Description
page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
Resource
Primary metadata about the asset.

Field
Type
Description
name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

TagAndCount
The tag and the count of matching assets.

Field
Type
Description
domain_tag
string
The tag.


Example: oceans
count
integer
The count of assets having the tag.


Example: 12076
TagMatch
Matching tags and where along the asset's tag the match occurred.

Field
Type
Description
tag_text
string
The tag of the matching asset.


Example: medicare
[array of array]
An array of indices defining the location of the match.

MatchOffsets
An array of indices defining the location of the match.

start
number
Where the matched query term starts, as a character count, in the associated asset field.


length
number
The number of characters the matched query term has.


Example: 4
Timings
Timing information for returning the user's query.

Field
Type
Description
serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8
TitleMatch
Matching titles and where along the asset's title the match occurred.

Field
Type
Description
title
string
The raw title of the matching asset.


Example: Medicaid Enrolled Provider Listing
display_title
string
An html marked up variant of the raw title that provides highlighting.


Example: <span class=highlight>Medi</span>caid Enrolled Provider Listing
id
string
The four-by-four identifier of the matching asset; only present when using the deduplicate=false param.


Example: keti-qx5t
[array of array]
An array of indices defining the location of the match.

MatchOffsets
An array of indices defining the location of the match.

start
number
Where the matched query term starts, as a character count, in the associated asset field.


length
number
The number of characters the matched query term has.


Example: 4
ValueAndCount
The facet value and the count of assets having that value.

Field
Type
Description
value
string
The facet value.


Example: dataset
count
integer
The count of assets having the value for that facet.


Example: 806
Responses
Describes responses from an API Operation, including design-time, static links to operations based on the response.

200 - Autocomplete Tags Response
The response from a query to api/catalog/v1/tags/autocomplete.

Field
Type
Description
[TagMatch]
An array of the autocomplete matches from a query.

tag_text
string
The tag of the matching asset.


Example: medicare
[array of array]
An array of indices defining the location of the match.

MatchOffsets
An array of indices defining the location of the match.

start
number
Where the matched query term starts, as a character count, in the associated asset field.


length
number
The number of characters the matched query term has.


Example: 4
resultSetSize
number
The total number of matches that could be returned from a query.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8
200 - Autocomplete Titles Response
The response from a query to api/catalog/v1/autocomplete.

Field
Type
Description
[TitleMatch]
An array of the autocomplete matches from a query.

title
string
The raw title of the matching asset.


Example: Medicaid Enrolled Provider Listing
display_title
string
An html marked up variant of the raw title that provides highlighting.


Example: <span class=highlight>Medi</span>caid Enrolled Provider Listing
id
string
The four-by-four identifier of the matching asset; only present when using the deduplicate=false param.


Example: keti-qx5t
[array of array]
An array of indices defining the location of the match.

MatchOffsets
An array of indices defining the location of the match.

start
number
Where the matched query term starts, as a character count, in the associated asset field.


length
number
The number of characters the matched query term has.


Example: 4
resultSetSize
number
The total number of matches that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8
200 - Count by Category Response
The response from a query to api/catalog/v1/domain_categories.

Field
Type
Description
[CategoryAndCount]
An array of categories and counts.

domain_category
string
The category.


Example: Health
count
integer
The count of assets having the category.


Example: 3590
resultSetSize
number
The total number of categories returned.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8
200 - Count by Domain Response
The response from a query to api/catalog/v1/domains.

Field
Type
Description
[DomainAndCount]
An array of domains and counts.

domain
string
The domain's name.


Example: data.ny.gov
count
integer
The count of assets from the named domain.


Example: 1488
resultSetSize
number
The total number of domains returned.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8
200 - Count by Facets Response
The response from a query to api/catalog/v1/domains/{domainName}/facets.

Field
Type
Description
facet
string
The facet class.


Example: datatypes
count
integer
The count of assets in the facet class.


Example: 806
[ValueAndCount]
The facet value and the count of assets having that value.

value
string
The facet value.


Example: dataset
count
integer
The count of assets having the value for that facet.


Example: 806
200 - Count by Tag Response
The response from a query to api/catalog/v1/domain_tags.

Field
Type
Description
[TagAndCount]
An array of tags and counts.

domain_tag
string
The tag.


Example: oceans
count
integer
The count of assets having the tag.


Example: 12076
resultSetSize
number
The total number of tags returned.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8
200 - Search Response
The response from a query to api/catalog.

Field
Type
Description
[Asset]
An array of the assets returned from a query.

Paginate results here.
Scroll through results here.

Resource
Primary metadata about the asset.

name
string
The name of the asset.

Search by this field here.
Search within this field here.
Sort by this field here.
Autocomplete this field here.


Example: Lottery Cash 4 Life Winning Numbers: Beginning 2014
id
string
The four-by-four identifier of the asset.

Search by this field here.
Sort by this field here.


Example: kwxv-fwze
description
string
The description of the asset or "" if not provided.

Search within this field here.


Example: Go to http://on.ny.gov/1xRIvPz on the New York Lottery website for past Cash 4 Life results and payouts.
parent_fxf
[string]
An array of parent four-by-fours; or empty if the asset has none.

Example: nhjr-rpi2
attribution
string
The organization to which the asset is attributed; or null if not provided.

Search by this field here.
Search within this field here.


Example: New York State Gaming Commission
attribution_link
string
The link provided by the organization to which the asset is attributed; or null if not provided.


Example: http://nylottery.ny.gov/wps/portal/Home/Lottery/home/your+lottery/drawing+results/drawingresults_cash4life
contact_email
string
The email address to contact if there are questions/comments about the asset; or null if not provided.


Example: opendata@its.ny.gov
type
string
The datatype of the asset.

Search by this field here.
Sort by this field here.


Example: dataset
updatedAt
string
The timestamp at which the asset was last updated.

Sort by this field here.


Example: 2024-08-02T10:03:06.000Z
createdAt
string
The timestamp at which the asset was created.

Sort by this field here.


Example: 2014-06-17T19:47:54.000Z
metadata_updated_at
string
The timestamp at which the asset's metadata (vs. data) was last updated.


Example: 2024-08-02T10:03:05.000Z
data_updated_at
string
The timestamp at which the asset's data (vs. metadata) was last updated.


Example: 2024-08-02T10:03:06.000Z
publication_date
string
The timestamp at which the asset was last published.


Example: 2021-04-27T14:13:45.000Z
Page Views
The set of page view data for the asset.

page_views_last_week
integer
The number of views the asset has had in the last week.

Sort by this field here.


Example: 581
page_views_last_month
integer
The number of views the asset has had in the last month.

Sort by this field here.


Example: 3763
page_views_total
integer
The number of views the asset has ever had.

Sort by this field here.


Example: 5920905
page_views_last_week_log
number
The base 2 log of the number of views the asset has had in the last week plus 1.


Example: 9.184875342908285
page_views_last_month_log
number
The base 2 log of the number of views the asset has had in the last month plus 1.


Example: 11.878050912728536
page_views_total_log
number
The base 2 log of the number of views the asset has ever had plus 1.


Example: 22.49738651911404
columns_name
[string]
An array of column names; or empty if asset has no columns.

Example: Winning Numbers
columns_field_name
[string]
An array of column field names; or empty if asset has no columns.

Example: winning_numbers
columns_datatype
[string]
An array of column datatypes; or empty if asset has no columns.

Example: Text
columns_description
[string]
An array of column descriptions; or empty if asset has no columns.

Example: Winning numbers
[columns_format]
An array of column formats; or empty if asset has no columns.

download_count
integer
The number of times the asset has been downloaded.


Example: 210231
provenance
string enum
Indicates whether the asset was created by a community user or a roled user.

Search by this field here.


Allowed: official ┃ community
locked
boolean
Whether the asset is locked against making changes to the asset.


Allowed: true ┃ false
blob_mime_type
string
The mimeType of the blob contained by a file asset; or null if the asset is not a file.


Example: text/plain; charset=us-ascii
hide_from_data_json
boolean
Whether this document has been marked to (not) appear in the data.json output of its domain.


Allowed: true ┃ false
lens_view_type
Replaced by 'type' field denoting the asset's datatype.

lens_display_type
Replaced by 'type' field denoting the asset's datatype.

Classification
Category, tags and custom metadata for the asset.

categories
In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.

tags
In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.

domain_category
string
The category of the asset; or not present in the response if not provided.

Search by this field here.
Search within this field here.
Sort by this field here.


Example: Government & Finance
domain_tags
[string]
An array of asset tags; or empty if the asset has none.

Example: cash 4 life
[domain_metadata]
An array of key/value objects containing the custom metadata of the asset; or empty if asset has no custom metadata.

Search by this field here.


key
string
The custom metadata key that can be used as a parameter with custom metadata search.


Example: Dataset-Information_Agency
value
string
The custom metadata value.


Example: Gaming Commission, New York State
Metadata
Secondary metadata about the asset.

domain
string
The domain the asset belongs to.

Search by this field here.


Example: data.ny.gov
license
string
The license the asset is release under; or not present in the response if not provided.

Search by this field here.


Example: Public+Domain
is_public
boolean
Whether the asset is public; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_published
boolean
Whether the asset is published; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_hidden
boolean
Whether the asset is hidden from the public catalog; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
[Approval]
For each target_audience, the approvals information for the asset.

state
string enum
The approvals state of the asset.

Search by this field here.


Allowed: approved ┃ rejected ┃ pending ┃ not_ready
target_audience
string enum
The audience the asset would like if approved.

Search by this field here.


Allowed: public ┃ internal
submission_outcome
string enum
The outcome of approval for the asset; or null if the asset is not submitted.


Allowed: change_audience ┃ update_published_asset
submitted_at
string
The timestamp at which the asset was submitted for approval; or null if the asset is not submitted.


Example: 2019-07-24T10:01:19.000Z
submitter_id
string
The four-by-four identifier of the user who submitted the asset; or null if the asset is not submitted.

Search by this field here.


Example: xzik-pf59
submitter_name
string
The display name of the user who submitted the asset; or null if the asset is not submitted.


Example: NY Open Data
submission_id
string
The identifier of the submission of the asset; or null if the asset is not submitted.


Example: NY Open Data
reviewed_automatically
boolean
Whether the asset was automatically approved vs manually approved; or null if the asset is not submitted.


Allowed: true ┃ false
reviewed_at
string
The timestamp at which the asset was reviewed for approval; or null if the asset is not submitted or reviewed.


Example: 2019-07-24T10:01:19.000Z
reviewer_id
string
The four-by-four identifier of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.

Search by this field here.


Example: r4qn-dwdd
reviewer_name
string
The display name of the user who reviewed the asset; or null if the asset is not submitted or reviewed or null if the asset was automatically reviewed.


Example: Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC
outcome_application_status
string enum
The status of applying the 'submission_outcome' to the asset; or null if the asset is not submitted and approved.


Allowed: success ┃ failure ┃ in_progress ┃ unclaimed
visible_to_anonymous
boolean
Whether the asset can be viewed by anonymous users; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
visible_to_site
boolean
Whether the asset can be viewed by all of the roled users on the asset's domain; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
is_derived
boolean
Whether the asset is derived from another; only present when using the show_visibility=true param.

Search by this field here.


Allowed: true ┃ false
Owner
User data about the user who owns the asset.

id
string
The four-by-four identifier of the user.

Search by this fieldhere.
Sort by this field here.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
Creator
User data about the user who created the asset.

id
string
The four-by-four identifier of the user.


Example: xzik-pf59
display_name
string
The display name of the user.


Example: NY Open Data
permalink
string
The permanent link of the asset.


Example: https://data.ny.gov/d/kwxv-fwze
link
string
The prettier, but non-permanent, link of the asset.


Example: https://data.ny.gov/Government-Finance/Lottery-Cash-4-Life-Winning-Numbers-Beginning-2014/kwxv-fwze
resultSetSize
number
The total number of assets that could be returned from a query. This will only equal the size of the results array if the total number is fewer than the given or default limit param.


Example: 1
Timings
Timing information for returning the user's query.

serviceMillis
number
The number of milliseconds needed to return the API response.


Example: 71
searchMillis
[number]
The number of milliseconds needed to fetch data from each call to OpenSearch.


Example: 8
400 - Disallowed offset Param Error
The error returned when the both scroll_id and offset parameters are given.

Field
Type
Description
error
string
The error message

Example: The `offset` and `scroll_id` parameters cannot both be specified
400 - Disallowed order Param Error
The error returned when the both scroll_id and order parameters are given.

Field
Type
Description
error
string
The error message.


Example: The `order` and `scroll_id` parameters cannot both be specified
400 - Incorrect approval_status Param Error
The error returned when an incorrect approval_status parameter is given.

Field
Type
Description
error
string
The error message.


Example: 'approval_status' must be one of List(approved, pending, rejected, not_ready); got good
400 - Incorrect audience Param Error
The error returned when an incorrect audience parameter is given.

Field
Type
Description
error
string
The error message.


Example: 'audience' must be one List(public, private, site); got everybody
400 - Incorrect order Param Error
The error returned when an incorrect order parameter is given.

Field
Type
Description
error
string
The error message.


Example: 'popularity' is not a supported sort
400 - Incorrect target_audience Param Error
The error returned when an incorrect target_audience parameter is given.

Field
Type
Description
error
string
The error message.


Example: 'target_audience' must be one of List(public, internal); got everybody
400 - Incorrect visibility Param Error
The error returned when an incorrect visibility parameter is given.

Field
Type
Description
error
string
The error message.


Example: 'visibility' must be one List(open, internal); got public
400 - Not a Four-by-Four Error
The error returned when a four-by-four parameter is incorrectly formatted.

Field
Type
Description
error
string
The error message.


Example: requirement failed: Id 'xzik' is not correctly formatted as a 4x4
400 - Not an Asset Four-by-Four Error
The error returned when a four-by-four parameter does not identify an asset.

Field
Type
Description
error
string
The error message.


Example: Id 'ku42jx2v' is incorrectly formatted and will not identify any asset.
400 - Too Much Data Requested Error
The error returned when the combination of the offset and limit parameters exceeds 10,000.

Field
Type
Description
error
string
The error message.


Example: Sum of `offset` and `limit` cannot exceed 10000. Please Deep scroll results instead.
401 - Unauthorized to Search NonPublic Data Error
The error returned when a user is unauthorized to search for private assets.

Field
Type
Description
error
string
The error message.


Example: User is not authorized to search private assets
401 - Unauthorized to Search Users Error
The error returned when a user is unauthorized to search assets shared to a particular user.

Field
Type
Description
error
string
The error message.


Example: User is not authorized to search assets shared to xzik-pf59
404 - Domain Not Found Error
The error returned when a provided domain is not found.

Field
Type
Description
error
string
The error message.


Example: Domain not found: data.ny.org.