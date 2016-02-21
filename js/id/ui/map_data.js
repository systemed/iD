iD.ui.MapData = function(context) {
    var key = 'F',
        features = context.features().keys(),
        fills = ['wireframe', 'partial', 'full'],
        fillDefault = context.storage('area-fill') || 'partial',
        fillSelected = fillDefault;


    function map_data(selection) {

        function showsFeature(d) {
            return context.features().enabled(d);
        }

        function autoHiddenFeature(d) {
            return context.features().autoHidden(d);
        }

        function clickFeature(d) {
            context.features().toggle(d);
            update();
        }

        function showsFill(d) {
            return fillSelected === d;
        }

        function setFill(d) {
            _.each(fills, function(opt) {
                context.surface().classed('fill-' + opt, Boolean(opt === d));
            });

            fillSelected = d;
            if (d !== 'wireframe') {
                fillDefault = d;
                context.storage('area-fill', d);
            }
            update();
        }

        function clickGpx() {
            context.background().toggleGpxLayer();
            update();
        }

        function clickMapillaryImages() {
            context.background().toggleMapillaryImageLayer();
            update();
        }

        function clickMapillarySigns() {
            context.background().toggleMapillarySignLayer();
            update();
        }


        function drawMapillaryItems(selection) {
            var mapillary = iD.services.mapillary,
                supportsMapillaryImages = !!mapillary,
                supportsMapillarySigns = !!mapillary && mapillary().signsSupported();

            var mapillaryList = selection
                    .selectAll('.mapillary-list')
                    .data([0]);

            // Enter
            mapillaryList
                .enter()
                .append('ul')
                .attr('class', 'layer-list mapillary-list');

            var mapillaryImageLayerItem = mapillaryList
                    .selectAll('.item-mapillary-images')
                    .data(supportsMapillaryImages ? [0] : []);

            var enterImages = mapillaryImageLayerItem.enter()
                .append('li')
                .attr('class', 'item-mapillary-images');

            var labelImages = enterImages.append('label')
                .call(bootstrap.tooltip()
                    .title(t('mapillary_images.tooltip'))
                    .placement('top'));

            labelImages.append('input')
                .attr('type', 'checkbox')
                .on('change', clickMapillaryImages);

            labelImages.append('span')
                .text(t('mapillary_images.title'));


            var mapillarySignLayerItem = mapillaryList
                    .selectAll('.item-mapillary-signs')
                    .data(supportsMapillarySigns ? [0] : []);

            var enterSigns = mapillarySignLayerItem.enter()
                .append('li')
                .attr('class', 'item-mapillary-signs');

            var labelSigns = enterSigns.append('label')
                .call(bootstrap.tooltip()
                    .title(t('mapillary_signs.tooltip'))
                    .placement('top'));

            labelSigns.append('input')
                .attr('type', 'checkbox')
                .on('change', clickMapillarySigns);

            labelSigns.append('span')
                .text(t('mapillary_signs.title'));

            // Update
            var showsMapillaryImages = supportsMapillaryImages && context.background().showsMapillaryImageLayer(),
                showsMapillarySigns = supportsMapillarySigns && context.background().showsMapillarySignLayer();

            mapillaryImageLayerItem
                .classed('active', showsMapillaryImages)
                .selectAll('input')
                .property('checked', showsMapillaryImages);

            mapillarySignLayerItem
                .classed('active', showsMapillarySigns)
                .selectAll('input')
                .property('checked', showsMapillarySigns);

            // Exit
            mapillaryImageLayerItem.exit()
                .remove();
            mapillarySignLayerItem.exit()
                .remove();
        }


        function drawGpxItem(selection) {
            var supportsGpx = iD.detect().filedrop,
                gpxLayerItem = selection
                    .selectAll('.layer-gpx')
                    .data(supportsGpx ? [0] : []);

            // Enter
            var enter = gpxLayerItem.enter()
                .append('ul')
                .attr('class', 'layer-list layer-gpx')
                .append('li')
                .classed('layer-toggle-gpx', true);

            enter.append('button')
                .attr('class', 'layer-extent')
                .call(bootstrap.tooltip()
                    .title(t('gpx.zoom'))
                    .placement('left'))
                .on('click', function() {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                    context.background().zoomToGpxLayer();
                })
                .call(iD.svg.Icon('#icon-search'));

            enter.append('button')
                .attr('class', 'layer-browse')
                .call(bootstrap.tooltip()
                    .title(t('gpx.browse'))
                    .placement('left'))
                .on('click', function() {
                    d3.select(document.createElement('input'))
                        .attr('type', 'file')
                        .on('change', function() {
                            context.background().gpxLayerFiles(d3.event.target.files);
                        })
                        .node().click();
                })
                .call(iD.svg.Icon('#icon-geolocate'));

            var labelGpx = enter.append('label')
                .call(bootstrap.tooltip()
                    .title(t('gpx.drag_drop'))
                    .placement('top'));

            labelGpx.append('input')
                .attr('type', 'checkbox')
                .on('change', clickGpx);

            labelGpx.append('span')
                .text(t('gpx.local_layer'));

            // Update
            var hasGpx = supportsGpx && context.background().hasGpxLayer(),
                showsGpx = supportsGpx && context.background().showsGpxLayer();

            gpxLayerItem
                .classed('active', showsGpx)
                .selectAll('input')
                .property('disabled', !hasGpx)
                .property('checked', showsGpx);

            // Exit
            gpxLayerItem.exit()
                .remove();
        }


        function drawList(selection, data, type, name, change, active) {
            var items = selection.selectAll('li')
                .data(data);

            // Enter
            var enter = items.enter()
                .append('li')
                .attr('class', 'layer')
                .call(bootstrap.tooltip()
                    .html(true)
                    .title(function(d) {
                        var tip = t(name + '.' + d + '.tooltip'),
                            key = (d === 'wireframe' ? 'W' : null);

                        if (name === 'feature' && autoHiddenFeature(d)) {
                            tip += '<div>' + t('map_data.autohidden') + '</div>';
                        }
                        return iD.ui.tooltipHtml(tip, key);
                    })
                    .placement('top')
                );

            var label = enter.append('label');

            label.append('input')
                .attr('type', type)
                .attr('name', name)
                .on('change', change);

            label.append('span')
                .text(function(d) { return t(name + '.' + d + '.description'); });

            // Update
            items
                .classed('active', active)
                .selectAll('input')
                .property('checked', active)
                .property('indeterminate', function(d) {
                    return (name === 'feature' && autoHiddenFeature(d));
                });

            // Exit
            items.exit()
                .remove();
        }

        function updateSelectAll(selection, active) {
          var items = selection.selectAll('li')
            .filter(function() {
                // filter out list item 'Select All' itself
                return !d3.select(this).classed('select-all');
            });

          // keeps a record of all list items checked
          var allFeaturesSelected = true;

          items.classed('active', function(e) {
            allFeaturesSelected = allFeaturesSelected && active(e);
            return active(e);
          });

          selection.selectAll('li.select-all')
            .classed('active', allFeaturesSelected)
            .selectAll('input')
            .property('checked', allFeaturesSelected);
        }

        function update() {
            dataLayerContainer.call(drawMapillaryItems);
            dataLayerContainer.call(drawGpxItem);

            fillList.call(drawList, fills, 'radio', 'area_fill', setFill, showsFill);

            featureList.call(drawList, features, 'checkbox', 'feature', clickFeature, showsFeature);
            featureList.call(updateSelectAll, showsFeature);
        }

        function hidePanel() {
            setVisible(false);
        }

        function togglePanel() {
            if (d3.event) d3.event.preventDefault();
            tooltip.hide(button);
            setVisible(!button.classed('active'));
        }

        function toggleWireframe() {
            if (d3.event) {
                d3.event.preventDefault();
                d3.event.stopPropagation();
            }
            setFill((fillSelected === 'wireframe' ? fillDefault : 'wireframe'));
            context.map().pan([0,0]);  // trigger a redraw
        }

        function toggleSelectAll(selection, toggle) {
          selection.selectAll('li')
            .filter(function() {
                return !d3.select(this).classed('select-all');
            })
            .classed('active', toggle)
            .selectAll('input')
            .property('checked', function(e) {
              if (d3.select(this).node().checked !== toggle) {
                context.features().toggle(e);
              }
            });

          update();
        }

        function setVisible(show) {
            if (show !== shown) {
                button.classed('active', show);
                shown = show;

                if (show) {
                    update();
                    selection.on('mousedown.map_data-inside', function() {
                        return d3.event.stopPropagation();
                    });
                    content.style('display', 'block')
                        .style('right', '-300px')
                        .transition()
                        .duration(200)
                        .style('right', '0px');
                } else {
                    content.style('display', 'block')
                        .style('right', '0px')
                        .transition()
                        .duration(200)
                        .style('right', '-300px')
                        .each('end', function() {
                            d3.select(this).style('display', 'none');
                        });
                    selection.on('mousedown.map_data-inside', null);
                }
            }
        }


        var content = selection.append('div')
                .attr('class', 'fillL map-overlay col3 content hide'),
            tooltip = bootstrap.tooltip()
                .placement('left')
                .html(true)
                .title(iD.ui.tooltipHtml(t('map_data.description'), key)),
            button = selection.append('button')
                .attr('tabindex', -1)
                .on('click', togglePanel)
                .call(iD.svg.Icon('#icon-data', 'light'))
                .call(tooltip),
            shown = false;

        content.append('h4')
            .text(t('map_data.title'));


        // data layers
        content.append('a')
            .text(t('map_data.data_layers'))
            .attr('href', '#')
            .classed('hide-toggle', true)
            .classed('expanded', true)
            .on('click', function() {
                var exp = d3.select(this).classed('expanded');
                dataLayerContainer.style('display', exp ? 'none' : 'block');
                d3.select(this).classed('expanded', !exp);
                d3.event.preventDefault();
            });

        var dataLayerContainer = content.append('div')
            .attr('class', 'data-data-layers')
            .style('display', 'block');


        // area fills
        content.append('a')
            .text(t('map_data.fill_area'))
            .attr('href', '#')
            .classed('hide-toggle', true)
            .classed('expanded', false)
            .on('click', function() {
                var exp = d3.select(this).classed('expanded');
                fillContainer.style('display', exp ? 'none' : 'block');
                d3.select(this).classed('expanded', !exp);
                d3.event.preventDefault();
            });

        var fillContainer = content.append('div')
            .attr('class', 'data-area-fills')
            .style('display', 'none');

        var fillList = fillContainer.append('ul')
            .attr('class', 'layer-list layer-fill-list');


        // feature filters
        content.append('a')
            .text(t('map_data.map_features'))
            .attr('href', '#')
            .classed('hide-toggle', true)
            .classed('expanded', false)
            .on('click', function() {
                var exp = d3.select(this).classed('expanded');
                featureContainer.style('display', exp ? 'none' : 'block');
                d3.select(this).classed('expanded', !exp);
                d3.event.preventDefault();
            });

        var featureContainer = content.append('div')
            .attr('class', 'data-feature-filters')
            .style('display', 'none');

        var featureList = featureContainer.append('ul')
            .attr('class', 'layer-list layer-feature-list');

        var selectAll = featureList.append('li')
            .attr('class', 'layer select-all')
            .append('label');

        selectAll.append('input')
            .attr('class', 'layer-feature-select-all')
            .attr('type', 'checkbox')
            .attr('name', 'select-all')
            .on('click', function() {
              var isChecked = d3.select(this).node().checked;
              featureList.call(toggleSelectAll, isChecked);
            });

        selectAll.append('span').text(t('map_data.select_all'));


        context.features()
            .on('change.map_data-update', update);

        setFill(fillDefault);

        var keybinding = d3.keybinding('features')
            .on(key, togglePanel)
            .on('W', toggleWireframe)
            .on('B', hidePanel)
            .on('H', hidePanel);

        d3.select(document)
            .call(keybinding);

        context.surface().on('mousedown.map_data-outside', hidePanel);
        context.container().on('mousedown.map_data-outside', hidePanel);
    }

    return map_data;
};
