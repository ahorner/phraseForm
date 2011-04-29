function NaturalForm(inputForm) {
  
  var self = this;
  
  self.form = $('<form></form>');
  
  self.inputs = {};
  self.contexts = {};
  self.groups = {};
  self.inUse = {};
  
  self.make = {
    
    from : function(inputForm) {
      self.form = inputForm;
      
      $('input', inputForm).each(function(){
        var input = $(this);
        
        self.inputs[input.attr('id')] = input;
        self.inUse[input.attr('id')] = false;
        
        input.detach();
      });
      
      inputForm.append('<span id="myQuery"></span>');
      
      return self.form;
    },
    new : function(params) {
      var options = $.extend({
        action : '#',
        method : 'POST',
        id : 'naturalLanguageSearchForm'
      }, params);
      
      self.form = $('<form></form>')
        .attr('action', options.action)
        .attr('method', options.method)
        .attr('id', options.id)
        .append($('<span id="myQuery"></span>'));
        
      return self.form;
    }
    
  };
  
  self.build = {
    
    input : function(params) {
      var options = $.extend({
        type : 'text'
      }, params);
      
      self.inputs[options.id] = $('<input />')
        .attr('type', options.type)
        .attr('id', options.id);
    },
    context : function(inputId, context) {
      self.contexts[inputId] = context;
    },
    contexts : function(contextList) {
      self.contexts = $.extend(self.contexts, contextList);
    },
    group : function(groupName, inputs) {
      self.groups[groupName] = inputs;
    },
    groups : function(groupList) {
      self.groups = $.extend(self.groups, groupList);
    }
    
  };
  
  self.groupAction = function(group, action) {
    
    $.each(group, function(index) {
      var inputId = group[index];
      action(inputId);
    });
    
  };
  
  self.query = function(inputString) {
    
    var query = inputString ? $(inputString) : $('#myQuery');
    var question = query.html();
    
    query.find('span').each(function(){
      question = question.replace($(this).attr('outerHTML'), $(this).html());
    });
    
    query.find('input').each(function(){
      question = question.replace($(this).attr('outerHTML'), $(this).val());
    });
    
    return question;
      
  };
  
  self.queryFor = function(forItem) {
    
    var question = '';
    
    function action(inputId) {
       question += self.query($('#myQuery .contextFor.' + inputId));
    }
    
    var group = self.groups[forItem];
    
    if (group == null)
      action(forItem);
    else
      self.groupAction(group, action);
    
    return question;
    
  };
  
  self.add = function(addItem) {
    
    var action = function(inputId) {
      if (self.inUse[inputId]) return;
        
      $('#myQuery').append(self.get(inputId).hide().fadeIn());
      self.inUse[inputId] = true;
    };
    var group = self.groups[addItem];
    
    if (group == null)
      action(addItem);
    else
      self.groupAction(group, action);
    
  };
  
  self.remove = function(removeItem) {
    
    var group = self.groups[removeItem];
    
    var action = function(inputId) {
      self.get(inputId).detach();
      self.inUse[inputId] = false;
    }
    
    if (group == null)
      action(removeItem);
    else
      self.groupAction(group, action)
      
  };
  
  self.get = function(inputId) {
    if (!self.inputs[inputId])
      return null;
    else if (self.inUse[inputId])
      return $('#myQuery .contextFor.' + inputId, self.form);
              
    var query = self.contexts[inputId];
    query = query.replace('%input', self.inputs[inputId].attr('outerHTML'));
    
    query = $("<span>" + query + " </span>")
      .addClass('contextFor')
      .addClass(inputId);
    
    return query;
  };
  
  if (inputForm) self.make.from(inputForm);
}